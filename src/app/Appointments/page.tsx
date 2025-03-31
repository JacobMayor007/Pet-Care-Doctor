"use client";

import DoctorNavigation from "../DoctorNavbar/page";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { fetchMyAppointment } from "../fetchData/fetchAppointment";
import { isAuthenticate } from "../fetchData/fetchUserData";

interface Appointments {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_IsNewPatient?: boolean;
  Appointment_Location?: string;
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

export default function Appointments() {
  const router = useRouter();

  const [myAppointments, setMyAppointments] = useState<Appointments[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointments[]>(
    []
  );
  const [tomorrowAppointments, setTomorrowAppointments] = useState<
    Appointments[]
  >([]);
  const [upcomingAppointments, setUpComingAppointments] = useState<
    Appointments[]
  >([]);

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login"); // Redirect if not logged in
      }
    };

    checkAuthentication();
  }, [router]);

  useEffect(() => {
    const getMyAppointments = async () => {
      try {
        const fetchedAppointments = await fetchMyAppointment();
        console.log("My Appointments", fetchedAppointments);

        setMyAppointments(
          fetchedAppointments.map((appointments: Appointments) => ({
            ...appointments,
            Appointment_Date: appointments.Appointment_Date
              ? dayjs(appointments.Appointment_Date.toDate())
              : null,
          }))
        );
      } catch (err) {
        console.log(err);
      }
    };
    getMyAppointments();
  }, []);

  useEffect(() => {
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

    const filterAppointments = (date: string) =>
      myAppointments.filter(
        (todays) => todays?.Appointment_Date?.format("YYYY-MM-DD") === date
      );

    const fetchTodayAppointments = filterAppointments(today);
    const fetchTomorrowAppointments = filterAppointments(tomorrow);
    const fetchUpcomingAppointments = myAppointments.filter(
      (appointment) =>
        dayjs(appointment.Appointment_Date).isAfter(tomorrow, "day") // Ensures upcoming is after tomorrow
    );

    setTodayAppointments(fetchTodayAppointments);
    setTomorrowAppointments(fetchTomorrowAppointments);
    setUpComingAppointments(fetchUpcomingAppointments);
    console.log(
      fetchTodayAppointments,
      fetchTomorrowAppointments,
      fetchUpcomingAppointments
    );
  }, [myAppointments]);

  return (
    <div>
      <DoctorNavigation />
      {todayAppointments.length > 0 ||
      tomorrowAppointments.length > 0 ||
      upcomingAppointments.length > 0 ? (
        <div className="mx-56 py-12 flex flex-col gap-8">
          <h1 className="font-montserrat font-bold text-[#393939] text-3xl">
            Appointments List
          </h1>
          <div className="flex flex-col gap-7">
            <h1 className="font-montserrat font-bold text-[#393939] text-3xl">
              Today
            </h1>
            <div className="grid grid-cols-3 ">
              {todayAppointments.map((data) => {
                return (
                  <div
                    key={data?.id}
                    className="w-80 h-fit border-[#C3C3C] border-[1px] rounded-xl p-5 drop-shadow-md bg-white"
                  >
                    <div className="flex flex-row items-center gap-2 ">
                      <div className="h-16 w-16 rounded-full bg-white drop-shadow-md flex items-center justify-center text-center overflow-hidden text-ellipsis text-nowrap text-xs">
                        Image of {data?.Appointment_PatientPetName}
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-montserrat text-xl font-bold text-[#393939]">
                          {data?.Appointment_PatientPetName}
                        </h1>
                        <p className="text-sm font-hind text-[#393939]">
                          Owner: {data?.Appointment_PatientFullName}
                        </p>
                      </div>
                    </div>
                    <div className="border-[1px] border-[#B1B1B1] w-full my-4" />
                    <div className="col-span-4 grid grid-cols-4 gap-2">
                      <p className=" text-[#393939] text-base">Breed</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_PatientPetBreed}
                      </p>
                      <p className="text-[#393939] text-base">Pet Age</p>
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
                      <p className="text-[#393939] text-base">When</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_Date?.format("MMMM DD, YYYY")}
                      </p>
                      <p className="text-[#393939] text-base">For</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_TypeOfAppointment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {tomorrowAppointments.length > 0 ? (
              <h1 className="font-montserrat font-bold text-3xl text-[#393939]">
                Tomorrow&#39;s
              </h1>
            ) : (
              <h1></h1>
            )}

            <div className="grid grid-cols-3 ">
              {tomorrowAppointments.map((data) => {
                return (
                  <div
                    key={data?.id}
                    className="w-80 h-fit border-[#C3C3C] border-[1px] rounded-xl p-5 drop-shadow-md bg-white"
                  >
                    <div className="flex flex-row items-center gap-2 ">
                      <div className="h-16 w-16 rounded-full bg-white drop-shadow-md flex items-center justify-center text-center overflow-hidden text-ellipsis text-nowrap text-xs">
                        Image of {data?.Appointment_PatientPetName}
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-montserrat text-xl font-bold text-[#393939]">
                          {data?.Appointment_PatientPetName}
                        </h1>
                        <p className="text-sm font-hind text-[#393939]">
                          Owner: {data?.Appointment_PatientFullName}
                        </p>
                      </div>
                    </div>
                    <div className="border-[1px] border-[#B1B1B1] w-full my-4" />
                    <div className="col-span-4 grid grid-cols-4 gap-2">
                      <p className=" text-[#393939] text-base">Breed</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_PatientPetBreed}
                      </p>
                      <p className="text-[#393939] text-base">Pet Age</p>
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
                      <p className="text-[#393939] text-base">When</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_Date?.format("MMMM DD, YYYY")}
                      </p>
                      <p className="text-[#393939] text-base">For</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_TypeOfAppointment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {upcomingAppointments.length > 0 ? (
              <h1 className="font-montserrat font-bold text-[#393939] text-3xl">
                Upcoming Appointments
              </h1>
            ) : (
              <h1></h1>
            )}
            <div className="grid grid-cols-3">
              {upcomingAppointments.map((data) => {
                return (
                  <div
                    key={data?.id}
                    className="w-80 h-fit border-[#C3C3C] border-[1px] rounded-xl p-5 drop-shadow-md bg-white"
                  >
                    <div className="flex flex-row items-center gap-2 ">
                      <div className="h-16 w-16 rounded-full bg-white drop-shadow-md flex items-center justify-center text-center overflow-hidden text-ellipsis text-nowrap text-xs">
                        Image of {data?.Appointment_PatientPetName}
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-montserrat text-xl font-bold text-[#393939]">
                          {data?.Appointment_PatientPetName}
                        </h1>
                        <p className="text-sm font-hind text-[#393939]">
                          Owner: {data?.Appointment_PatientFullName}
                        </p>
                      </div>
                    </div>
                    <div className="border-[1px] border-[#B1B1B1] w-full my-4" />
                    <div className="col-span-4 grid grid-cols-4 gap-2">
                      <p className=" text-[#393939] text-base">Breed</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_PatientPetBreed}
                      </p>
                      <p className="text-[#393939] text-base">Pet Age</p>
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
                      <p className="text-[#393939] text-base">When</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_Date?.format("MMMM DD, YYYY")}
                      </p>
                      <p className="text-[#393939] text-base">For</p>
                      <p className="text-end text-[#006B95] font-bold font-hind col-span-3">
                        {data?.Appointment_TypeOfAppointment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <h1></h1>
      )}
    </div>
  );
}
