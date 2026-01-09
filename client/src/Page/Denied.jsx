import { useNavigate } from "react-router-dom";

function Denied() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col justify-center items-center  h-screen bg-[#1a2238]">
      <h1 className="   text-9xl text-white font-semibold tracking-widest">
        403
      </h1>
      <div className=" absolute  bg-black rotate-12  rounded-sm px-3 text-white mb-10">
        Access Denied..
      </div>
      <button
        onClick={() => navigate("/")}
        className="mt-5  relative inline-block text-sm  font-medium text-[#FF6A3D]  group active:text-yellow-500  focus:outline-none focus:ring"
      >
        <span className=" relative block px-8 py-3 bg-[#1a2238] border border-current">
          Go back
        </span>
      </button>
    </div>
  );
}
export default Denied;
