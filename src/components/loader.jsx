export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col justify-center items-center gap-4">
      
      {/* Simple Spinning Ring */}
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

      {/* Loading Text */}
      <p className="text-gray-600 font-semibold tracking-widest text-sm uppercase animate-pulse">
        Loading...
      </p>

    </div>
  );
}