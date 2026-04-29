import { useEffect, useState } from "react";
import { useGuestStore } from "../store/useGuestStore";
import GuestChat from "../components/GuestChat";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import toast from "react-hot-toast";

const Guest = () => {
  const { guestName, loadGuestName, setGuestName } = useGuestStore();
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    loadGuestName();
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Please enter a name");
      return;
    }
    setGuestName(nameInput.trim());
  };

  if (guestName) {
    return (
      <div className="h-screen bg-base-200 pt-16">
        <div className="flex items-center justify-center h-full">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <GuestChat />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Guest Chat</h1>
              <p className="text-base-content/60">
                Join the public chat room without an account
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Display Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={50}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Join Room
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Want a full account?{" "}
              <Link to="/login" className="link link-primary">
                Log in
              </Link>{" "}
              or{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Chat freely, no account needed"
        subtitle="Share messages and files with anyone in the guest room instantly."
      />
    </div>
  );
};

export default Guest;
