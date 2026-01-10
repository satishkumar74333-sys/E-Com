import { useDispatch, useSelector } from "react-redux";
import { HandelDelete, HandelPromotion } from "../../Redux/Slice/authSlice";
import { useEffect, useState } from "react";
import LoadingButton from "../../constants/LoadingBtn";

export const UsersCart = ({ users }) => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState([]);
  const [loading, setLoadingStates] = useState({});
  const [loadingPromotion, setLoadingPromotion] = useState({});
  const { role, data } = useSelector((state) => state?.auth);
  useEffect(() => {
    const sortedUsers = [
      ...users.filter((user) => user.role === "AUTHOR"),
      ...users.filter((user) => user.role === "ADMIN"),
      ...users.filter(
        (user) => user.role !== "AUTHOR" && user.role !== "ADMIN"
      ),
    ];
    setUserData(sortedUsers);
  }, [users]);

  async function handleDelete(data) {
    setLoadingStates((prev) => ({ ...prev, [data.id]: true }));
    if (role == "AUTHOR") {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (!isConfirmed) {
        setLoadingStates((prev) => ({ ...prev, [data.id]: false }));
        return;
      }
      if (data.id) {
        setUserData((prevUserData) =>
          prevUserData.filter((user) => user._id !== data.id)
        );
      }

      await dispatch(HandelDelete({ data: data }));
      setLoadingStates((prev) => ({ ...prev, [data.id]: false }));
    } else {
      if (["ADMIN", "AUTHOR"].includes(data.role)) {
        setLoadingStates((prev) => ({ ...prev, [data.id]: false }));
        alert("You do not have permission for this action.");
        return;
      }
      if (data.role == "USER") {
        const isConfirmed = window.confirm(
          "Are you sure you want to delete this user?"
        );
        if (!isConfirmed) {
          setLoadingStates((prev) => ({ ...prev, [data.id]: false }));
          return;
        }
        if (data.id) {
          setUserData((prevUserData) =>
            prevUserData.filter((user) => user._id !== data.id)
          );
          await dispatch(HandelDelete({ data: data }));
          setLoadingStates((prev) => ({ ...prev, [data.id]: false }));
        }
      }
    }
  }

  async function handelPromotion(data) {
    setLoadingPromotion((prev) => ({ ...prev, [data.id]: true }));
    if (role !== "AUTHOR") {
      setLoadingPromotion((prev) => ({ ...prev, [data.id]: false }));
      alert("You do not have permission for this action.");
      return;
    }
    const res = await dispatch(HandelPromotion({ data: data }));
    setLoadingPromotion((prev) => ({ ...prev, [data.id]: false }));
    if (res && res.payload?.success) {
      setUserData((prevUserData) =>
        prevUserData.map((user) =>
          user._id === data.id ? { ...user, role: data.role } : user
        )
      );
    } else {
      alert(res.payload?.message);
    }
  }

  return (
    <>
      <>
        <h2 className="text-3xl max-w-xs:text-2xl font-semibold text-center max-w-xs:mb-2 mb-6 text-gray-800 dark:text-white">
          Manage Users
        </h2>
        <section className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-lg dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white">
              <tr>
                <th className="p-4 text-left">No.</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((user, index) => (
                <tr key={user._id} className="border-b dark:border-gray-600">
                  <td className="p-4 text-sm text-gray-800 dark:text-white">
                    #{index + 1}
                  </td>
                  <td className="p-4 text-sm">{user.fullName}</td>
                  <td className="p-4 text-sm text-blue-600 hover:underline">
                    <a href={`tel:+${user.phoneNumber}`}>{user.phoneNumber}</a>
                  </td>
                  <td className="p-4 text-sm text-blue-600 hover:underline">
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td className="p-4 text-sm">{user.role}</td>
                  <td className="p-4 flex space-x-4">
                    {role === "AUTHOR" && user.role === "USER" && (
                      <LoadingButton
                        ADMIN={user._id == data._id}
                        message={"Loading..."}
                        width={"w-[100px]"}
                        name={"ADMIN"}
                        textSize={"text-sm py-2"}
                        loading={loadingPromotion[user._id]}
                        onClick={() =>
                          handelPromotion({ role: "ADMIN", id: user._id })
                        }
                        color={"bg-yellow-500 hover:bg-yellow-600 text-white"}
                      />
                    )}
                    {role === "AUTHOR" && user.role === "AUTHOR" && (
                      <LoadingButton
                        ADMIN={user._id == data._id}
                        message={"Loading..."}
                        width={"w-[100px]"}
                        name={"USER"}
                        textSize={"text-sm py-2"}
                        loading={loadingPromotion[user._id]}
                        onClick={() =>
                          handelPromotion({ role: "USER", id: user._id })
                        }
                        color={"bg-yellow-500 hover:bg-yellow-600 text-white"}
                      />
                    )}
                    {role === "AUTHOR" && user.role === "ADMIN" && (
                      <LoadingButton
                        ADMIN={user._id == data._id}
                        message={"Loading..."}
                        width={"w-[100px]"}
                        name={"USER"}
                        textSize={"text-sm py-2"}
                        loading={loadingPromotion[user._id]}
                        onClick={() =>
                          handelPromotion({ role: "USER", id: user._id })
                        }
                        color={"bg-yellow-500 hover:bg-yellow-600 text-white"}
                      />
                    )}
                    {role === "AUTHOR" && user.role === "ADMIN" && (
                      <LoadingButton
                        ADMIN={user._id == data._id}
                        message={"Loading..."}
                        width={"w-[100px]"}
                        name={"AUTHOR"}
                        textSize={"text-sm py-2"}
                        loading={loadingPromotion[user._id]}
                        onClick={() =>
                          handelPromotion({ role: "AUTHOR", id: user._id })
                        }
                        color={"bg-green-500 hover:bg-green-600 text-white"}
                      />
                    )}
                    {role === "AUTHOR" && user.role === "AUTHOR" && (
                      <LoadingButton
                        ADMIN={user._id == data._id}
                        message={"Loading..."}
                        width={"w-[100px]"}
                        name={"ADMIN"}
                        textSize={"text-sm py-2"}
                        loading={loadingPromotion[user._id]}
                        onClick={() =>
                          handelPromotion({ role: "ADMIN", id: user._id })
                        }
                        color={"bg-green-500 hover:bg-green-600 text-white"}
                      />
                    )}
                    {role === "AUTHOR" && user.role === "USER" && (
                      <LoadingButton
                        ADMIN={user._id == data._id}
                        message={"Loading..."}
                        width={"w-[100px]"}
                        name={"AUTHOR"}
                        textSize={"text-sm py-2"}
                        loading={loadingPromotion[user._id]}
                        onClick={() =>
                          handelPromotion({ role: "AUTHOR", id: user._id })
                        }
                        color={"bg-green-500 hover:bg-green-600 text-white"}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </>
    </>
  );
};
