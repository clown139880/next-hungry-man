import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
  RealtimeChannelSendResponse,
} from "@supabase/supabase-js";
import { getRandomColors, getRandomUniqueColor } from "lib/RandomColor";
import cloneDeep from "lodash.clonedeep";
import throttle from "lodash.throttle";
import router, { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import supabaseClient from "supabase/client";
import { Payload } from "types";
import { v4 } from "uuid";

export interface User extends Coordinates {
  color: string;
  hue: string;
  isTyping?: boolean;
  message?: string;
  roomId: string;
}
export interface Coordinates {
  x: number | undefined;
  y: number | undefined;
}

declare global {
  interface Window {
    sendMessages?: (payload: {
      message: string;
      boardTitle: string;
      taskTitle?: string;
    }) => void;
  }
}

const LATENCY_THRESHOLD = 400;
const MAX_ROOM_USERS = 50;
const MAX_DISPLAY_MESSAGES = 50;
const MAX_EVENTS_PER_SECOND = 10;
const X_THRESHOLD = 25;
const Y_THRESHOLD = 35;

export default function useMultiPlayer(roomId?: string, userId?: string) {
  const usersRef = useRef<{ [key: string]: User }>({});
  const isTypingRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const mousePositionRef = useRef<Coordinates>();
  const joinTimestampRef = useRef<number>();
  const insertMsgTimestampRef = useRef<number>();

  // We manage the refs with a state so that the UI can re-render
  const [isTyping, _setIsTyping] = useState<boolean>(false);
  const [isCancelled, _setIsCancelled] = useState<boolean>(false);
  const [mousePosition, _setMousePosition] = useState<Coordinates>();
  const [latency, setLatency] = useState<number>(0);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const setIsTyping = (value: boolean) => {
    isTypingRef.current = value;
    _setIsTyping(value);
  };

  const setIsCancelled = (value: boolean) => {
    isCancelledRef.current = value;
    _setIsCancelled(value);
  };

  const setMousePosition = (coordinates: Coordinates) => {
    mousePositionRef.current = coordinates;
    _setMousePosition(coordinates);
  };
  const mapInitialUsers = (userChannel: RealtimeChannel, roomId: string) => {
    const state = userChannel.presenceState<{ user_id: string }>();
    const _users = Object.entries(state)
      .map(([_roomId, _users]) =>
        _users.map(({ user_id }) => ({ roomId: _roomId, userId: user_id }))
      )
      .flat();

    if (!_users) return;

    // Deconflict duplicate colours at the beginning of the browser session
    const colors =
      Object.keys(usersRef.current).length === 0
        ? getRandomColors(_users.length)
        : [];

    if (_users) {
      setUsers((existingUsers) => {
        const updatedUsers = _users.reduce(
          (acc: { [key: string]: User }, { userId, roomId }, index: number) => {
            const userColors = Object.values(usersRef.current).map(
              (user: any) => user.color
            );
            // Deconflict duplicate colors for incoming clients during the browser session
            const color =
              colors.length > 0
                ? colors[index]
                : getRandomUniqueColor(userColors);

            acc[userId] = existingUsers[userId] || {
              x: 0,
              y: 0,
              color: color.bg,
              hue: color.hue,
              roomId: roomId,
            };
            return acc;
          },
          {}
        );
        usersRef.current = updatedUsers;
        return updatedUsers;
      });
    }
  };

  const [isInitialStateSynced, setIsInitialStateSynced] =
    useState<boolean>(false);

  useEffect(() => {
    if (!roomId || !userId) return;
    let roomChannel: RealtimeChannel;

    /* 
        Client is re-joining 'rooms' channel and the user's id will be tracked with Presence.

        Note: Realtime enforces unique channel names per client so the previous 'rooms' channel
        has already been removed in the cleanup function.
      */
    roomChannel = supabaseClient.channel("rooms", {
      config: { presence: { key: roomId } },
    });
    roomChannel.on(
      REALTIME_LISTEN_TYPES.PRESENCE,
      { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
      () => {
        setIsInitialStateSynced(true);
        mapInitialUsers(roomChannel, roomId);
      }
    );
    roomChannel.subscribe(async (status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        const resp: RealtimeChannelSendResponse = await roomChannel.track({
          user_id: userId,
        });

        if (resp === "ok") {
          console.log("Successfully joined room");
          //   router.push(`/issue/${roomId}`);
        } else {
          // alert(resp);
          //   router.push(`/issue/`);
        }
      }
    });

    const messageChannel = supabaseClient.channel(`messages`);

    messageChannel.subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        // Lodash throttle will be removed once realtime-js client throttles on the channel level
        // window.addEventListener("keydown", onKeyDown);
        window.sendMessages = (payload) => {
          messageChannel
            .send({
              type: REALTIME_LISTEN_TYPES.BROADCAST,
              event: "MESSAGE",
              payload: {
                ...payload,
                userId,
              },
            })
            .then((resp) => {
              console.log(resp, "broadcast message");
            })
            .catch(console.error);
        };
      }
    });

    // Listen for messages sent by other users directly via Broadcast
    messageChannel.on(
      REALTIME_LISTEN_TYPES.BROADCAST,
      { event: "MESSAGE" },
      (
        payload: Payload<{
          userId: string;
          boardTitle: string;
          taskTitle?: string;
          message: string;
        }>
      ) => {
        console.log("MESSAGEpayload", payload);
        toast(
          `[${payload.payload?.userId}][${payload.payload?.boardTitle}][${payload.payload?.taskTitle}]` +
            ":" +
            payload.payload?.message,
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );

        setUsers((users) => {
          const userId = payload!.payload!.userId;
          const existingUser = users[userId];

          if (existingUser) {
            users[userId] = {
              ...existingUser,
              ...{
                // isTyping: payload?.payload?.isTyping,
              },
            };
            users = cloneDeep(users);
          }

          return users;
        });
      }
    );

    // Must properly remove subscribed channel
    return () => {
      roomChannel && supabaseClient.removeChannel(roomChannel);
      messageChannel && supabaseClient.removeChannel(messageChannel);
      window.sendMessages = () => {};
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId]);

  useEffect(() => {
    console.log("useEffect", isInitialStateSynced);
    if (!roomId || !isInitialStateSynced || !userId) return;

    let pingIntervalId: ReturnType<typeof setInterval> | undefined;
    let pingChannel: RealtimeChannel;
    let setMouseEvent: (e: MouseEvent) => void = () => {},
      onKeyDown: (e: KeyboardEvent) => void = () => {}; // Ping channel is used to calculate roundtrip time from client to server to client
    pingChannel = supabaseClient.channel(`ping:${userId}`, {
      config: { broadcast: { ack: true } },
    });

    pingChannel.subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        console.log("pingChannel subscribed");
        pingIntervalId = setInterval(async () => {
          const start = performance.now();
          const resp = await pingChannel.send({
            type: "broadcast",
            event: "PING",
            payload: {},
          });

          if (resp !== "ok") {
            console.log("pingChannel broadcast error");
            setLatency(-1);
          } else {
            const end = performance.now();
            const newLatency = end - start;

            setLatency(newLatency);
          }
        }, 1000);
      }
    });
    const posChannel = supabaseClient.channel(`cursors:${roomId}`);

    posChannel.subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        // Lodash throttle will be removed once realtime-js client throttles on the channel level
        const sendMouseBroadcast = throttle(({ x, y }) => {
          const resp = posChannel
            .send({
              type: "broadcast",
              event: "POS",
              payload: { user_id: userId, x, y },
            })
            .then((resp) => {
              console.log(resp, "broadcast pos");
            })
            .catch((e) => {
              console.error(e);
            });
          console.log(resp, "broadcast pos");
        }, 1000 / MAX_EVENTS_PER_SECOND);

        setMouseEvent = (e: MouseEvent) => {
          const [x, y] = [e.clientX, e.clientY];
          sendMouseBroadcast({ x, y });
          setMousePosition({ x, y });
        };

        onKeyDown = async (e: KeyboardEvent) => {
          console.log("current", document.activeElement?.id);

          if (document.activeElement?.id?.startsWith("vditor")) return;

          // Start typing session
          if (
            // e.code === "Enter" ||
            e.key.length === 1 &&
            !e.metaKey
          ) {
            if (!isTypingRef.current) {
              setIsTyping(true);
              setIsCancelled(false);

              posChannel
                .send({
                  type: "broadcast",
                  event: "MESSAGE",
                  payload: { user_id: userId, isTyping: true, message: "" },
                })
                .catch(() => {});
            } else if (e.code === "Enter") {
              // End typing session and send message
              setIsTyping(false);
              posChannel
                .send({
                  type: "broadcast",
                  event: "MESSAGE",
                  payload: {
                    user_id: userId,
                    isTyping: false,
                  },
                })
                .catch((e) => {
                  alert(e.message);
                });
            }
          }

          // End typing session without sending
          if (e.code === "Escape" && isTypingRef.current) {
            setIsTyping(false);
            setIsCancelled(true);

            posChannel
              .send({
                type: "broadcast",
                event: "MESSAGE",
                payload: { user_id: userId, isTyping: false, message: "" },
              })
              .catch(() => {});
          }
        };

        window.addEventListener("mousemove", setMouseEvent);
        // window.addEventListener("keydown", onKeyDown);
      }
    });

    posChannel.on(
      REALTIME_LISTEN_TYPES.BROADCAST,
      { event: "POS" },
      (payload: Payload<{ user_id: string } & Coordinates>) => {
        console.log("POSpayload", payload);
        setUsers((users) => {
          const userId = payload!.payload!.user_id;
          const existingUser = users[userId];

          if (existingUser) {
            const x =
              (payload?.payload?.x ?? 0) - X_THRESHOLD > window.innerWidth
                ? window.innerWidth - X_THRESHOLD
                : payload?.payload?.x;
            const y =
              (payload?.payload?.y ?? 0 - Y_THRESHOLD) > window.innerHeight
                ? window.innerHeight - Y_THRESHOLD
                : payload?.payload?.y;

            users[userId] = { ...existingUser, ...{ x, y } };
            users = cloneDeep(users);
          }

          return users;
        });
      }
    );

    return () => {
      pingIntervalId && clearInterval(pingIntervalId);

      window.removeEventListener("mousemove", setMouseEvent);

      pingChannel && supabaseClient.removeChannel(pingChannel);
      posChannel && supabaseClient.removeChannel(posChannel);
    };
  }, [isInitialStateSynced, roomId, userId]);

  return {
    isTyping,
    isCancelled,
    mousePosition,
    latency,
    users,
  };
}
