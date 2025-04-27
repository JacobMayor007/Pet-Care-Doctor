"use client";
import DoctorNavigation from "../DoctorNavbar/page";
import {
  fetchMyAppointment,
  postPaidAppointment,
} from "../fetchData/fetchAppointment";
import { useState, useEffect } from "react";
import { Dayjs } from "dayjs";
import Image from "next/image";
import { Modal } from "antd";
import "@ant-design/v5-patch-for-react-19";
import Link from "next/link";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

interface myAppointments {
  id?: string;
  Appointment_CreatedAt?: Dayjs | null;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_DoctorUID?: string;
  Appointment_IsNewPatient?: string;
  Appointment_Location?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientPetAge?: {
    Month: number;
    Year: number;
  };
  Appointment_PatientPetBP?: {
    Hg?: number;
    mm?: number;
  };
  Appointment_PatientPetBreed?: string;
  Appointment_PatientPetName?: string;
  Appointment_PatientTypeOfPayment?: string;
  Appointment_PatientUserUID?: string;
  Appointment_Status?: string;
  Appointment_TypeOfAppointment?: string;
  Appointment_Price?: number;
  Appointment_isPaid?: boolean;
  Appointment_Time?: string;
}

export default function Transaction() {
  const [myAppointments, setMyAppointments] = useState<myAppointments[]>([]);
  const paid = myAppointments.map((data) => data?.Appointment_isPaid);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<myAppointments | null>(
    null
  );

  useEffect(() => {
    const getMyAppointment = async () => {
      const myAppointments = await fetchMyAppointment();

      setMyAppointments(myAppointments);
    };
    getMyAppointment();
  }, []);

  const paidNotificationHandle = async () => {
    try {
      const docRef = collection(db, "notifications");
      await addDoc(docRef, {
        appointment_ID: selectedPatient?.id,
        sender: selectedPatient?.Appointment_DoctorUID,
        sender_FullName: selectedPatient?.Appointment_DoctorName,
        receiver_FullName: selectedPatient?.Appointment_PatientFullName,
        receiverID: selectedPatient?.Appointment_PatientUserUID,
        title: `Paid Notification`,
        message: `Dr. ${
          selectedPatient?.Appointment_DoctorName
        } have received your payment on your appointment at, ${selectedPatient?.Appointment_Date?.format(
          "MMMM DD, YYYY"
        )} ${selectedPatient?.Appointment_Time}`,
        createdAt: Timestamp.now(),
        hide: false,
        open: false,
        status: "unread",
        isApproved: true,
      });
    } catch (error) {
      console.error();
    }
  };

  return (
    <div>
      <div className="relative z-20">
        <DoctorNavigation />
      </div>
      <div className="flex mx-52 my-10 flex-col gap-8 z-10">
        <h1 className="font-bold font-montserrat text-4xl ">Transactions</h1>
        <div className="grid grid-cols-5 bg-white drop-shadow-lg h-fit rounded-2xl p-8 gap-5 ">
          <h1
            className={`${
              paid ? `col-span-3` : `col-span-2`
            } font-montserrat text-3xl font-bold text-[#393939]`}
          >
            Pet
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Price
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Status
          </h1>
          <div className="w-full h-0.5 rounded-full bg-[#B1B1B1] col-span-5 flex flex-col" />
          {myAppointments.map((data) => {
            return (
              <div
                key={data?.id}
                className="grid grid-cols-5 col-span-5 items-center px-4 py-6 border-b-[1px] border-[#C3C3C3] relative"
              >
                <div className="">
                  <h1 className="font-hind font-bold">
                    Image of {data?.Appointment_PatientPetName}
                  </h1>
                </div>
                <div
                  className={`
                     col-span-2
                   flex flex-col gap-0.5`}
                >
                  <p className="font-hind font-bold text-[#006B95]">
                    Owner: {data?.Appointment_PatientFullName}
                  </p>
                  <h1 className="font-montserrat font-bold text-lg">
                    {" "}
                    {data?.Appointment_TypeOfAppointment}
                  </h1>
                  <div className="flex flex-row items-center gap-4">
                    <Image
                      src={`/${data?.Appointment_PatientTypeOfPayment} Image.svg`}
                      alt={`${data?.Appointment_PatientTypeOfPayment} Image`}
                      height={20}
                      width={20}
                      className="object-contain"
                    />
                    <p className="font-hind text-xl text-[#232323]">
                      {data?.Appointment_PatientTypeOfPayment}{" "}
                    </p>
                  </div>
                </div>
                <div className="justify-self-center font-hind text-[#232323] text-xl font-medium">
                  Php {data?.Appointment_Price}
                </div>

                {data?.Appointment_Status === "Approved" ? (
                  <button
                    type="button"
                    className=" h-fit py-2 w-fit px-4 ml-8 bg-[#006B95] text-white rounded-md"
                    onClick={() => {
                      setConfirmPaid(true);
                      setSelectedPatient(data);
                    }}
                  >
                    Click here if Paid
                  </button>
                ) : (
                  <h1 className="font-montserrat font-bold text-[#393939] text-center text-2xl">
                    {data?.Appointment_Status === "isPending" && "Pending"}
                    {data?.Appointment_Status === "Paid" && "Paid"}
                  </h1>
                )}
                <Link
                  href={`PatientDetails/${data?.id}`}
                  className="font-montserrat italic underline text-[#006B95] text-center absolute -top-4 -right-5"
                >
                  View Patient
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        open={confirmPaid}
        onOk={() => {
          setConfirmPaid(false);
          paidNotificationHandle();
          postPaidAppointment(selectedPatient?.id || "");
        }}
        centered
        onClose={() => setConfirmPaid(false)}
        onCancel={() => setConfirmPaid(false)}
      >
        <h1 className="font-montserrat font-bold ">
          Please confirm that patient{" "}
          <span className="text-[#006B95] capitalize">
            {selectedPatient?.Appointment_PatientFullName}
          </span>{" "}
          is paid?
        </h1>
      </Modal>
    </div>
  );
}
