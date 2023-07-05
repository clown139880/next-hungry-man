const Button = ({
  type = "submit",
  className = "",
  onClick,
  loading,
  children,
}: {
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={className}
      disabled={loading}
    >
      {children}
    </button>
  );
};
export default Button;
