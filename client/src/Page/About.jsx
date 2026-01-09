import Layout from "../layout/layout";
import AboutImage from "../assets/home/download.jpg";
import FeedbackForm from "../Components/feedbackfrom";
import FeedbackList from "../Components/feedbackList";
import { useSelector } from "react-redux";
function About() {
  const { happyCustomers, TotalFeedbackCount } = useSelector(
    (state) => state?.feedback
  );
  const { totalProducts } = useSelector((state) => state?.product);
  function formatCount(count) {
    if (count >= 1_000_000_000) {
      return (count / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (count >= 1_000_000) {
      return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (count >= 1_000) {
      return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return count?.toString();
  }

  return (
    <Layout>
      <div className="sm:mt-[50px ]  select-none relative max-sm:mt-2">
        <div className="flex  w-full  max-sm:flex-wrap ">
          <div className="w-full p-1 max-w-xs:p-0    sm:pl-[100px] flex justify-center ">
            <img
              src={AboutImage}
              className=" sm:rounded-tr-[200px] max-w-xs:rounded max-sm:w-full  rounded-lg   h-[350px] "
              alt="About_image"
            />
          </div>
          <div className="  w-full sm:pr-10 ">
            <div className="font-bold text-black dark:text-white  w-full my-5 flex flex-col gap-3 mr-28   text-center">
              <h1 className="sm:text-4xl max-w-xs:text-xl max-sm:text-2xl  ">
                {" "}
                Exquisite Design Combined
              </h1>
              <span className="sm:text-3xl  max-sm:text-xl">
                {" "}
                With Functionalities
              </span>
            </div>
            <p className=" line-clamp-3 max-sm:px-5 max-w-xs:text-xl   relative  sm:m-5 text-xl text-[#909090] max-sm:my-10 text-center">
              Nune in Arcu Et Scelerisque Dignissim. Aliquam Enim Nunc, Volutpat
              Eget Ipsum Id, Varius Sodales Mi. vestibulum Ante lpsum Primis In
              Facucibus Orci Luctus Et Ultrices
            </p>

            <p className="font-bold text-[#8f8f8f] my-6   text-center max-sm:px-8">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet,
              tempore?
            </p>
            <div className="w-full justify-center flex  ">
              <img
                src={AboutImage}
                className="w-[250px] h-[200px] object-contain rounded-lg   "
                alt="About_image2"
              />
            </div>
          </div>
        </div>
        <div className="flex max-w-xs:text-xl  capitalize text-black  dark:text-white  sm:text-3xl max-sm:text-2xl  justify-center text-center w-full my-10  max-sm:px-[10%] sm:px-[20%] ">
          <h1 className="font-medium">
            {" "}
            🤩 i am passionately dedicated to 😊
            <span className="font-bold"> crafting timeless</span>🤪 elegance and{" "}
            <span className="font-bold text-yellow-300">
              🤘 capturing the essence of individual
            </span>{" "}
            <span>👌 stories our brand is not just about adornment 💯</span>
          </h1>
        </div>
        <div className="  select-none  flex gap-5 max-w-xs:gap-2 capitalize  justify-center flex-wrap max-w-xs:my-2 max-w-xs:p-2 my-5 p-5">
          <div className="flex flex-col justify-center cursor-pointer  p-5 rounded hover:bg-[#f1d6cb] dark:bg-[#111825] dark:border-2 border-[#182237] bg-[#fce7de] text-center line-clamp-2 sm:min-w-[200px]">
            <h1 className="text-2xl max-w-xs:text-xl font-bold">15+</h1>
            <p className="text-xl max-w-xs:text-sm ">All Over India </p>
          </div>
          <div className="flex flex-col justify-center cursor-pointer  p-5 rounded hover:bg-[#f1d6cb] bg-[#fce7de] dark:bg-[#111825] dark:border-2 border-[#182237] text-center line-clamp-2 sm:min-w-[200px]">
            <h1 className="text-2xl font-bold">{formatCount(totalProducts)}</h1>
            <p className="text-xl max-w-xs:text-sm">prodect avaliable </p>
          </div>
          <div className="flex flex-col justify-center cursor-pointer  p-5 rounded hover:bg-[#f1d6cb] bg-[#fce7de] dark:bg-[#111825] dark:border-2 border-[#182237] text-center line-clamp-2 sm:min-w-[200px]">
            <h1 className="text-2xl max-w-xs:text-xl font-bold">
              {" "}
              {formatCount(TotalFeedbackCount)}
            </h1>
            <p className="text-xl max-w-xs:text-sm">prodect reviews </p>
          </div>
          <div className="flex flex-col justify-center cursor-pointer  p-5 rounded hover:bg-[#f1d6cb] bg-[#fce7de] dark:bg-[#111825] dark:border-2 border-[#182237] text-center line-clamp-2 sm:min-w-[200px] ">
            <h1 className="text-2xl max-w-xs:text-xl font-bold capitalize">
              {" "}
              {formatCount(happyCustomers)}
            </h1>
            <p className="text-xl max-w-xs:text-sm ">happy customers</p>
          </div>
        </div>
        {/* feedback section */}
        <div className="w-full  ">
          <hr className="h-1 bg-slate-200" />
          <h1 className="text-2xl font-bold mb-4 ml-10 text-start dark:text-white text-black">
            feedback Section
          </h1>
          <FeedbackForm />
          <FeedbackList />
        </div>
      </div>
    </Layout>
  );
}
export default About;
