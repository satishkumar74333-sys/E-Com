import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { LoadAccount } from "../../Redux/Slice/authSlice";
import Layout from "../../layout/layout";
import ShopInformationForm from "../../Components/shopInfo";

const Settings = () => {
  const dispatch = useDispatch();

  const loadProfile = async () => {
    await dispatch(LoadAccount());
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <Layout>
      <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen select-none">
        <header className="bg-white dark:bg-gray-800 shadow-sm top-[50px] sm:top-[66px] z-40 w-full fixed">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-indigo-600">Settings</h1>
            </div>
          </div>
        </header>
        <div className="pt-[100px] max-w-xs:pt-[50px]">
          <ShopInformationForm />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;