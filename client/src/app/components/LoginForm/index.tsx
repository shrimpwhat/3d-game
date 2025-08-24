import { useRef } from "react";

export default function LoginForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form>
      <input ref={inputRef} placeholder="User login" />
      <button>Enter</button>
    </form>
  );
}
