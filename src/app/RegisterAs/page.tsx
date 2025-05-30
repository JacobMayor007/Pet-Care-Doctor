"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBowlRice,
  faChevronDown,
  faDove,
  faHandHoldingMedical,
  faHandshakeSimple,
  faHouseUser,
  faPaw,
} from "@fortawesome/free-solid-svg-icons";

export default function RegisterAs() {
  const [signUpAs, setSignUpAs] = useState(false);

  const registerAsData = [
    {
      key: 0,
      label: "Pet Veterinarian",
      icon: faHandHoldingMedical,
      route: "/Sign-Up-Doctor",
    },
    {
      key: 1,
      label: "Pet Owner",
      icon: faPaw,
      route: "https://pet-care-pro.vercel.app/Sign-Up",
    },
    {
      key: 2,
      label: "Pet Product Seller",
      icon: faHandshakeSimple,
      route: "https://seller-pet-care-pro.vercel.app/Sign-Up-Seller",
    },

    {
      key: 3,
      label: "Pet Sitting Services",
      icon: faBowlRice,
      route: "/Sitter",
    },
    {
      key: 4,
      label: "Pet Memorial",
      icon: faDove,
      route: "https://memorial-pet-care-pro.vercel.app/Sign-Up-Memorial",
    },

    {
      key: 5,
      label: "Pet Boarding Services",
      icon: faHouseUser,
      route: "https://boarding-pet-care-pro.vercel.app/Sign-Up-Boarding",
    },
  ];
  return (
    <div>
      <div className="relative z-20 cursor-pointer font-medium font-montserrat rounded-lg w-fit gap-2 text-center h-10 flex items-center ">
        <div
          onClick={() => setSignUpAs((prev) => !prev)}
          className=" w-full gap-2 text-center h-10 flex items-center px-2"
        >
          Register As?
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
      <Modal
        open={signUpAs}
        centered
        onClose={() => setSignUpAs(false)}
        onCancel={() => setSignUpAs(false)}
      >
        <div className="grid grid-cols-3 gap-5 m-5">
          {registerAsData.map((data) => (
            <Link
              href={data.route}
              key={data.key}
              className="font-hind font-medium h-24 cursor-pointer text-center hover:text-white"
              onClick={() => setSignUpAs(false)}
            >
              <div className=" border-2 hover:bg-[#006B95] font-montserrat font-bold text-[#466571] rounded-md border-[#006B95] hover:text-white h-full flex flex-col items-center justify-center">
                <FontAwesomeIcon
                  icon={data?.icon}
                  className={`text-2xl text-[#ADD8E6]`}
                />

                {data?.label}
              </div>
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  );
}
