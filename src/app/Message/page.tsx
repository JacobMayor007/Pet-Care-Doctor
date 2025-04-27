"use client";

import { Modal } from "antd";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/app/firebase/config";

export default function Message() {
  const [searchValue, setSearchValue] = useState("");
  const [userList, setUserList] = useState<DocumentData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([]);

  useEffect(() => {
    const getUsersList = async () => {
      const docRef = collection(db, "Users");
      const userSnapshot = await getDocs(docRef);

      const userList = userSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: `${data?.User_Name}`,
          email: `${data?.User_Email}`,
        };
      });

      console.log("Fetch Users: ", userList);
      setUserList(userList);
    };
    getUsersList();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    const filtered = userList.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );

    setFilteredUsers(filtered); // Update filtered users with the search results
  };
  return (
    <div>
      <Modal
        open
        className="relative"
        onClose={() => history.back()}
        onCancel={() => history.back()}
      >
        <h1>
          Please search the user email who you want to have a conversation with.
        </h1>

        <input
          type="text"
          name="search"
          id="search-user-id"
          placeholder="Search user email"
          onChange={handleInputChange}
          className="h-8 border-2 border-[#797979] rounded-lg drop-shadow-md font-hind px-2 my-10 w-96 mx-auto outline-none"
        />
        {filteredUsers.length > 0 && searchValue ? (
          <div className="absolute  bg-white w-fit  flex flex-col gap-2 rounded-md">
            {filteredUsers?.slice(0, 7).map((user, index) => {
              return (
                <Link
                  href={`/Message/${user?.id}`}
                  key={index}
                  className="border-b-[1px] border-[#797979] px-8 py-2  hover:bg-slate-300 cursor-pointer"
                >
                  <h1 className="font-montserrat font-medium capitalize">
                    {user?.fullName}
                  </h1>
                  <p className="font-hind text-xs">{user?.email}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="hidden"></div>
        )}
      </Modal>
    </div>
  );
}
