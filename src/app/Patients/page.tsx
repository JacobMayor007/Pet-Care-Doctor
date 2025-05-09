"use client";
import { useEffect, useState } from "react";

import { fetchMyPatient } from "../fetchData/fetchAppointment";
import DoctorNavigation from "../DoctorNavbar/page";
import { Dayjs } from "dayjs";

interface MyAppointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_IsNewPatient?: boolean;
  Appointment_Location?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientPetAge?: {
    Month?: number;
    Year?: number;
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
  Appointment_Time?: string;
}

export default function Patients() {
  const [myAppointment, setMyAppointment] = useState<MyAppointment[]>([]);

  useEffect(() => {
    const getMyAppointments = async () => {
      const fetchedMyAppointments = await fetchMyPatient();
      setMyAppointment(fetchedMyAppointments);
    };
    getMyAppointments();
  }, []);

  return (
    <div>
      <div className="relative z-20">
        <DoctorNavigation />
      </div>
      <div className="pt-10 mx-40 flex flex-col gap-8 z-10">
        <h1 className="font-montserrat font-bold text-3xl text-[#393939]">
          My Patients
        </h1>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="search-bar"
            id="searchBar"
            className="h-12 rounded-xl w-[659px] bg-[#EAEBEC] px-4 font-montserrat outline-none"
          />
          <div className="w-full grid grid-cols-4 gap-4">
            {myAppointment.map((data) => {
              return (
                <div
                  key={data?.id}
                  className="flex flex-col w-72 h-fit border-[1px] p-4 border-[#C3C3C3] rounded-2xl"
                >
                  <div className="flex flex-row w-full gap-2 items-center">
                    <div className="h-16 w-16 bg-white rounded-full drop-shadow-xl text-xs font-montserrat flex justify-center items-center text-center text-ellipsis overflow-hidden text-nowrap">
                      Image of {data?.Appointment_PatientPetName}
                    </div>
                    <div>
                      <h1 className="font-montserrat font-bold text-base text-[#393939]">
                        {data?.Appointment_PatientPetName}
                      </h1>
                      <p className="text-[#767676] font-hind text-sm">
                        Owner: {data?.Appointment_PatientFullName}
                      </p>
                    </div>
                  </div>
                  <div className="border-[1px] border-[#B1B1B1] my-3" />

                  <div className="grid grid-cols-7 pt-2 w-full">
                    <div className="font-hind text-sm text-[#767676] col-span-7 grid grid-cols-4 gap-5 justify-center w-full">
                      <p>Status:</p>
                      <p className="text-end text-[#006B95] text-base font-bold col-span-3">
                        {data?.Appointment_Status === "isPending"
                          ? `Pending`
                          : data?.Appointment_Status}
                      </p>
                      <p>For:</p>
                      <p className="text-end text-[#006B95] text-base font-bold col-span-3">
                        {data?.Appointment_TypeOfAppointment}
                      </p>

                      <p>Age:</p>
                      <p className="text-end text-[#006B95] text-base font-bold col-span-3">
                        {data?.Appointment_PatientPetAge?.Year === undefined ||
                        data?.Appointment_PatientPetAge?.Year === 0
                          ? ""
                          : data?.Appointment_PatientPetAge?.Year > 1
                          ? `${data.Appointment_PatientPetAge.Year} years,`
                          : `${data.Appointment_PatientPetAge.Year} year,`}{" "}
                        {data?.Appointment_PatientPetAge?.Month === undefined ||
                        data?.Appointment_PatientPetAge?.Month === 0
                          ? ""
                          : data?.Appointment_PatientPetAge?.Month > 1
                          ? `${data.Appointment_PatientPetAge.Month} months`
                          : `${data.Appointment_PatientPetAge.Month} month`}
                      </p>
                      <p>Breed:</p>
                      <p className="text-end text-[#006B95] text-base font-bold col-span-3">
                        {data?.Appointment_PatientPetBreed}
                      </p>
                      <a
                        href={`/PatientDetails/${data?.id}`}
                        className="col-span-4 h-10 bg-[#006B95] rounded-xl text-white flex justify-center items-center"
                      >
                        View Patient Details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
