"use client";

import { auth, provider } from "@/app/firebase/config";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  FacebookAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import Image from "next/image";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import RegisterAs from "../RegisterAs/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Select, TimePicker } from "antd";
import Link from "next/link";
import { Dayjs } from "dayjs";

export default function RegisterAsDoctor() {
  const specialtyRef = useRef<HTMLInputElement>(null);
  const subSpecialtyRef = useRef<HTMLInputElement>(null);
  const [checkBox, setCheckBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [confirmShow, setConfirmShow] = useState(false);
  const [others, setOthers] = useState(false);
  const [subOthers, setSubOthers] = useState(false);
  const [usingAuth, setUsingAuth] = useState(false);
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    specialty: "",
    subspecialty: "",
    petTypes: [],
    professionalTitle: "",
    clinicAddress: "",
    licenseNumber: "",
    universityAttended: "",
    yearsOfExperience: 0,
    clinicName: "",
    User_AvailableHours: {
      Days: [],
    },
    Time_In: "",
    Time_Out: "",
  });

  const weeks = [
    {
      key: 0,
      value: 0,
      label: "Sunday",
    },
    {
      key: 1,
      value: 1,
      label: "Monday",
    },
    {
      key: 2,
      value: 2,
      label: "Tuesday",
    },
    {
      key: 3,
      value: 3,
      label: "Wednesday",
    },
    {
      key: 4,
      value: 4,
      label: "Thursday",
    },
    {
      key: 5,
      value: 5,
      label: "Friday",
    },
    {
      key: 6,
      value: 6,
      label: "Saturday",
    },
  ];

  const router = useRouter();

  const [createUserWithEmailAndPassword, loading] =
    useCreateUserWithEmailAndPassword(auth);
  const db = getFirestore();

  console.log(formData.Time_In);
  console.log(formData.Time_Out);

  const options = [
    { label: "Dogs", value: "dogs" },
    { label: "Cats", value: "cats" },
    { label: "Birds", value: "birds" },
    { label: "Reptiles", value: "reptiles" },
    { label: "Exotic Animal", value: "exotic animal" },
  ];

  console.log(formData.fName + " " + formData.lName);

  const handleSignUp = async () => {
    try {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (isSubmitting) return;

      setIsSubmitting(true);

      // Basic Validation
      if (
        !formData.fName ||
        !formData.lName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.contact ||
        !formData.specialty ||
        !formData.subspecialty ||
        !formData.professionalTitle ||
        !formData.clinicAddress ||
        !formData.licenseNumber ||
        !formData.universityAttended ||
        !formData.clinicName ||
        !formData.Time_In ||
        !formData.Time_Out ||
        !formData.User_AvailableHours
      ) {
        alert("All fields are required.");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      if (!regex.test(formData.password)) {
        alert(
          "Please input atleast one uppercase, lowercase, and one special character, and number!"
        );
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      if (!formData.email.includes("@")) {
        alert("Invalid Email Address");
        return;
      }

      if (!checkBox) {
        alert("Please check the terms and conditions");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      const usersQuery = query(
        collection(db, "Users"),
        where("User_Email", "==", formData.email)
      );
      const pendingQuery = query(
        collection(db, "pending_users"),
        where("User_Email", "==", formData.email)
      );

      const [usersSnapshot, pendingSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(pendingQuery),
      ]);

      if (!usersSnapshot.empty || !pendingSnapshot.empty) {
        alert("This email is already registered or pending approval");
        setIsSubmitting(false);
        return;
      }

      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (!res || !res.user) {
        throw new Error("Failed to create user. Please try again.");
      }

      // Add user data to Firestore
      const userRef = doc(db, "pending_users", res.user.uid);
      await setDoc(userRef, {
        User_Name: formData.fName + " " + formData.lName,
        User_Email: formData.email,
        User_UID: res.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });

      const doctorRef = doc(db, "doctor", res.user.uid);
      await setDoc(doctorRef, {
        createdAt: Timestamp.now(),
        doctor_email: formData.email,
        doctor_uid: res.user.uid,
        doctor_name: formData.fName + " " + formData.lName,
        doctor_title: formData.professionalTitle,
        doctor_contact: formData.contact,
        doctor_clinicAddress: formData.clinicAddress,
        doctor_clinicName: formData.clinicName,
        doctor_pet_types_treated: formData.petTypes,
        doctor_specialty: formData.specialty,
        doctor_sub_specialty: formData.subspecialty,
        doctor_experience: formData.yearsOfExperience,
        doctor_university_attended: formData.universityAttended,
        doctor_license_number: formData.licenseNumber,
        doctor_available_days: formData.User_AvailableHours.Days,
        doctor_time_in: formData.Time_In,
        doctor_time_out: formData.Time_Out,
        termsAndConditions: checkBox,
      });

      await signOut(auth);

      // Clear input fields
      setFormData({
        fName: "",
        lName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contact: "",
        specialty: "",
        subspecialty: "",
        petTypes: [],
        professionalTitle: "",
        clinicAddress: "",
        licenseNumber: "",
        universityAttended: "",
        yearsOfExperience: 0,
        clinicName: "",
        User_AvailableHours: {
          Days: [],
        },
        Time_In: "",
        Time_Out: "",
      });

      // Redirect to login page or home page
      router.push("/pending-approval");
    } catch (error) {
      console.error("Error during sign-up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleAuth = async () => {
    try {
      if (
        !formData.contact ||
        !formData.specialty ||
        !formData.subspecialty ||
        !formData.petTypes ||
        !formData.professionalTitle ||
        !formData.clinicAddress ||
        !formData.licenseNumber ||
        !formData.universityAttended ||
        !formData.yearsOfExperience ||
        !formData.clinicName
      ) {
        alert("All fields are required.");
        setIsSubmitting(false);
        setUsingAuth(true);
        return;
      }

      const result = await signInWithPopup(auth, provider);
      console.log(result.providerId);

      const userRef = doc(db, "pending_users", result.user.uid);
      await setDoc(userRef, {
        User_Name: result.user.displayName,
        User_Email: result.user.email,
        User_UID: result.user.uid,
        CreatedAt: Timestamp.now(),
      });

      const doctorRef = doc(db, "doctor", result.user.uid);
      await setDoc(doctorRef, {
        doctor_fullName: result.user.displayName,
        doctor_email: result.user.email,
        doctor_uid: result.user.uid,
        terms_and_conditions: checkBox,
        createdAt: Timestamp.now(),
        doctor_info: {
          contact: formData.contact,
          specialty: formData.specialty,
          subspecialty: formData.subspecialty,
          pet_types_to_treat: formData.petTypes,
          professional_title: formData.professionalTitle,
          clinic_name: formData.clinicName,
          clinic_address: formData.clinicAddress,
          license_number: formData.licenseNumber,
          university_last_attended: formData.universityAttended,
          years_of_experience: formData.yearsOfExperience,
        },
      });

      await signOut(auth);

      router.push("/pending-approval");
    } catch (error) {
      console.log(error);
    }
  };

  const facebookAuth = async () => {
    try {
      if (
        !formData.contact ||
        !formData.specialty ||
        !formData.subspecialty ||
        !formData.petTypes ||
        !formData.professionalTitle ||
        !formData.clinicAddress ||
        !formData.licenseNumber ||
        !formData.universityAttended ||
        !formData.yearsOfExperience ||
        !formData.clinicName
      ) {
        alert("All fields are required.");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      const result = await signInWithPopup(
        getAuth(),
        new FacebookAuthProvider()
      );
      const userRef = doc(db, "pending_users", result.user.uid);
      await setDoc(userRef, {
        User_Name: result.user.displayName,
        User_Email: result.user.email,
        User_UID: result.user.uid,
        CreatedAt: Timestamp.now(),
      });

      const doctorRef = doc(db, "doctor", result.user.uid);
      await setDoc(doctorRef, {
        doctor_fullName: result.user.displayName,
        doctor_email: result.user.email,
        doctor_uid: result.user.uid,
        terms_and_conditions: checkBox,
        createdAt: Timestamp.now(),
        doctor_info: {
          contact: formData.contact,
          specialty: formData.specialty,
          subspecialty: formData.subspecialty,
          pet_types_to_treat: formData.petTypes,
          professional_title: formData.professionalTitle,
          clinic_name: formData.clinicName,
          clinic_address: formData.clinicAddress,
          license_number: formData.licenseNumber,
          university_last_attended: formData.universityAttended,
          years_of_experience: formData.yearsOfExperience,
        },
      });

      await signOut(auth);

      router.push("/pending-approval");
    } catch (err) {
      console.log(err);
    }
  };

  console.log(formData.petTypes);

  return (
    <div
      className={`bg-[#9FE1DB] bg-signUp ${usingAuth ? `h-screen` : `h-full`}`}
    >
      <div className="h-fit flex flex-row">
        <div className="w-[30%]">
          <h1 className="text-5xl font-sigmar font-normal text-white mt-10 text-center">
            Pet Care Pro
          </h1>
          <Image
            src="/Logo.svg"
            width={626}
            height={650}
            alt="Logo Icon"
            className="object-contain mt-8"
          />
        </div>
        <div
          className={`w-[70%] rounded-[25px_0px_0px_25px] z-[2] bg-white flex flex-col px-20 gap-7 ${
            usingAuth ? `h-screen` : `h-fit`
          }`}
        >
          <div className="mt-5 flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/PawPrint.svg"
                height={50}
                width={50}
                alt="Paw Print Icon"
              />
              <h1 className="text-3xl font-montserrat font-bold">
                Doctor&#39;s Registration
              </h1>
            </div>
            <div className="relative z-20 border-2 cursor-pointer font-medium font-montserrat border-gray-300 rounded-lg drop-shadow-md w-fit gap-2 text-center h-10 flex items-center ">
              <RegisterAs />
            </div>
          </div>
          <form
            className="flex flex-col gap-7 z-10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className="grid grid-cols-7 gap-5">
              <div className={usingAuth ? `hidden` : `relative col-span-3`}>
                <label
                  className="absolute left-7 -top-3 bg-white text-sm font-hind w-fit text-nowrap"
                  htmlFor="fName"
                >
                  First Name{" "}
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="fName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.fName}
                  onChange={(e) =>
                    setFormData({ ...formData, fName: e.target.value })
                  }
                />
              </div>
              <div className={usingAuth ? `hidden` : `relative  col-span-3`}>
                <label
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Last Name
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="last name"
                  id="lName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.lName}
                  onChange={(e) =>
                    setFormData({ ...formData, lName: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <label
                  className="absolute left-4 -top-3  bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Title
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                {/* <input
                  type="text"
                  name="title"
                  id="professional-title"
                  value={formData.professionalTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      professionalTitle: e.target.value,
                    })
                  }
                  placeholder="MD, MPM"
                /> */}
                <select
                  value={formData.professionalTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      professionalTitle: e.target.value,
                    })
                  }
                  required
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                >
                  <option value="">Select your title</option>
                  <option value="DVM">
                    Doctor of Veterinary Medicine (DVM)
                  </option>
                  <option value="BVSc">
                    Bachelor of Veterinary Science (BVSc)
                  </option>
                  <option value="VMD">Veterinary Medical Doctor (VMD)</option>
                  <option value="DACVS">
                    Diplomate of the American College of Veterinary Surgeons
                    (DACVS)
                  </option>
                  <option value="DACVIM">
                    Diplomate of the American College of Veterinary Internal
                    Medicine (DACVIM)
                  </option>
                  <option value="ECVN">
                    European College of Veterinary Neurology (ECVN)
                  </option>
                  <option value="MVZ">
                    Médico Veterinario Zootecnista (MVZ)
                  </option>
                  <option value="Dr.">Doctor (Dr.)</option>
                  <option value="med.">Medicinae( med.)</option>
                  <option value="vet.">Veterinariae(vet.)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className={usingAuth ? `hidden` : `relative`}>
                <label
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                  htmlFor="email-address"
                >
                  Email Address
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="emailAdd"
                  id="email-address"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="relative border-solid border-black rounded-md border-[1px] pl-1 pr-2 flex flex-row items-center">
                <label
                  className="absolute left-7 z-20 -top-3 bg-white text-sm font-hind"
                  htmlFor="phone-number"
                >
                  Phone Number
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <p className="  bg-white py-1 px-1 font-montserrat font-medium drop-shadow-md rounded-md">
                  +63
                </p>
                <input
                  type="number"
                  name="Phone"
                  id="phone-number"
                  onKeyDown={(event) => {
                    if (
                      event.key == "." ||
                      event.key === "-" ||
                      event.key === "e"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="h-12 w-full outline-none text-base font-hind px-2 [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={usingAuth ? `hidden` : `grid grid-cols-2 gap-5`}>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute left-7 -top-3 bg-white text-sm  font-hind"
                >
                  Password
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={show ? `text` : `password`}
                  name="password"
                  id="password"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.password}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={show ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    className="object-contain cursor-pointer"
                    draggable={false}
                    onClick={() => setShow((prev) => !prev)}
                  />
                </div>
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-7 -top-3 bg-white text-sm font-hind"
                >
                  Confirm Password
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={confirmShow ? `text` : `password`}
                  name="confirm password"
                  id="confirmPassword"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={confirmShow ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    draggable={false}
                    className="object-contain cursor-pointer"
                    onClick={() => setConfirmShow((prev) => !prev)}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-5">
              <div className="relative col-span-6">
                <label
                  htmlFor="clinic"
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                >
                  Clinic Address
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={`text`}
                  name="business"
                  id="business-address"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.clinicAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clinicAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div className="relative col-span-3 w-full">
                <label
                  htmlFor="business-name"
                  className="absolute left-7 -top-3  bg-white text-sm text-nowrap font-hind"
                >
                  Clinic Name
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={`text`}
                  name="businessName"
                  id="business-name"
                  className="h-12 border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.clinicName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clinicName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="relative col-span-3 flex items-center">
                <label
                  htmlFor="business-name"
                  className="absolute left-7 z-20 -top-3  bg-white text-sm text-nowrap font-hind"
                >
                  Pet Types Treated:
                  <span className="text-red-500 text-xs font-montserrat ">
                    {"("}optional{")"}
                  </span>
                </label>
                <Select
                  mode="multiple"
                  allowClear
                  options={options}
                  onChange={(value) =>
                    setFormData({ ...formData, petTypes: value })
                  }
                  className="h-full w-full text-nowrap overflow-y-scroll outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-5">
              <div className="relative col-span-2">
                <label
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                  htmlFor="specialty-id"
                >
                  Specialty
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                {others ? (
                  <div className="h-12 px-2 flex justify-between rounded-md items-center w-full border-[1px] border-solid border-black">
                    <input
                      ref={specialtyRef}
                      type="text"
                      name="specialty"
                      id="specialty-id"
                      placeholder="Medicine"
                      className="h-full outline-none w-full text-base font-hind "
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                    />
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="ml-2 text-lg cursor-pointer"
                      onClick={() => setOthers(false)}
                    />
                  </div>
                ) : (
                  <select
                    value={formData.specialty}
                    onChange={(e) => {
                      if (e.target.value === "Others") {
                        setOthers(true);
                        specialtyRef.current?.focus();
                        setFormData({ ...formData, specialty: "" }); // Clear the value when Others is selected
                      } else {
                        setFormData({ ...formData, specialty: e.target.value });
                      }
                    }}
                    required
                    className="h-12 w-full cursor-pointer border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  >
                    <option value="">Select a specialty</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Anesthesia">Anesthesia</option>
                    <option value="Behavior">Behavior</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Theriogenology">Theriogenology</option>
                    <option value="Exotic Companion Mammal Practice">
                      Exotic Companion Mammal Practice
                    </option>
                    <option value="Avian Medicine">Avian Medicine</option>
                    <option value="Reptile/Amphibian Practice">
                      Reptile/Amphibian Practice
                    </option>
                    <option value="Canine/Feline Practice">
                      Canine/Feline Practice
                    </option>
                    <option value="Others">Others</option>
                  </select>
                )}
              </div>
              <div className="relative col-span-2 px-2 flex flex-row items-center border-[1px] border-solid border-black rounded-md">
                <label
                  className="absolute left-7 z-20 -top-3 bg-white text-sm font-hind"
                  htmlFor="sub-specialty-id"
                >
                  Sub-Specialty
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                {subOthers ? (
                  <div className="h-12 px-2 flex justify-between rounded-md items-center w-full ">
                    <input
                      ref={subSpecialtyRef}
                      type="text"
                      name="sub-specialty"
                      id="sub-specialty-id"
                      className="h-full w-full outline-none text-base font-hind "
                      value={formData.subspecialty}
                      placeholder="Primary Care"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subspecialty: e.target.value,
                        })
                      }
                    />
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="ml-2 text-lg cursor-pointer"
                      onClick={() => setSubOthers(false)}
                    />
                  </div>
                ) : (
                  <select
                    value={formData.subspecialty}
                    onChange={(e) => {
                      if (e.target.value === "Others") {
                        setSubOthers(true);
                        subSpecialtyRef.current?.focus();
                        setFormData({ ...formData, subspecialty: "" }); // Clear the value when Others is selected
                      } else {
                        setFormData({
                          ...formData,
                          subspecialty: e.target.value,
                        });
                      }
                    }}
                    required
                    className="h-12 w-full outline-none  rounded-md text-base font-hind"
                  >
                    <option value="">Select a specialty</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Practice">General Practice</option>
                    <option value="Others">Others</option>
                  </select>
                )}
              </div>
              <div className="relative border-solid border-black rounded-md border-[1px] pl-1 pr-2 flex flex-row items-center">
                <label
                  className="absolute left-7 z-20 -top-3 bg-white text-sm font-hind"
                  htmlFor="experience-id"
                >
                  Years of Exp.
                  <span className="text-red-500 text-xs font-montserrat ">
                    {"("}optional{")"}
                  </span>
                </label>
                <input
                  type="number"
                  name="experience"
                  id="experience-id"
                  onKeyDown={(event) => {
                    if (
                      event.key == "." ||
                      event.key === "-" ||
                      event.key === "e"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="h-12 w-full outline-none text-base font-hind px-2 [&::-webkit-inner-spin-button]:appearance-none"
                  value={
                    formData.yearsOfExperience == 0
                      ? ""
                      : formData.yearsOfExperience
                  }
                  placeholder="Ex. 11"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute left-7 -top-3 bg-white text-sm  font-hind"
                >
                  University Attended
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="university-attended"
                  id="university-attended-id"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.universityAttended}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      universityAttended: e.target.value,
                    })
                  }
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="license-number-id"
                  className="absolute left-7 -top-3 bg-white text-sm font-hind"
                >
                  License Number
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  id="license-number-id"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licenseNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="relative border-[1px] border-black rounded-md h-fit py-2 flex flex-row items-center px-2">
                <label
                  htmlFor="available-days-id"
                  className="absolute left-7 -top-3 bg-white text-sm  font-hind"
                >
                  Available Days
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Available Days"
                  options={weeks}
                  className=" h-fit w-full"
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      User_AvailableHours: { Days: value },
                    })
                  }
                />
              </div>
              <div className="relative border-[1px] border-black rounded-md flex items-center gap-4 px-2 ">
                <label
                  htmlFor="available-time-from-id"
                  className="absolute left-7 -top-3 bg-white h-fit text-sm font-hind"
                >
                  Available Time
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                {/* <input
                  type="text"
                  name="licenseNumber"
                  id="license-number-id"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licenseNumber: e.target.value,
                    })
                  }
                /> */}

                <TimePicker
                  placeholder="Time-in"
                  className="h-9"
                  format={"hh:mm A "}
                  use12Hours
                  onChange={(date: Dayjs) =>
                    setFormData({
                      ...formData,
                      Time_In: date.format("hh:mm A"),
                    })
                  }
                />
                <TimePicker
                  placeholder="Time-out"
                  className="h-9"
                  format={"hh:mm A "}
                  use12Hours
                  onChange={(date: Dayjs) =>
                    setFormData({
                      ...formData,
                      Time_Out: date.format("hh:mm A"),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-row gap-3">
              <input
                type="checkbox"
                name="agree"
                id="agreeTandT"
                className="w-6 h-6 text-base font-hind px-2"
                checked={checkBox}
                onChange={() => setCheckBox((prev) => !prev)}
              />
              <p>
                I agree to the{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Conditions
                </span>
                <span className="text-red-500 text-sm font-montserrat ml-1">
                  *
                </span>
              </p>
            </div>
            <div>
              <p>
                Already have an account?{" "}
                <span className="text-base font-hind text-[#4ABEC5]">
                  <Link href="/Login">Log in here</Link>
                </span>
              </p>
            </div>
            <div className={usingAuth ? `hidden` : `block`}>
              <button
                type="submit"
                id="signup-button"
                className={`w-[200px] h-[50px] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6BE8DC] hover:bg-blue-400"
                } text-[22px] font-montserrat font-bold text-white rounded-lg`}
                disabled={Boolean(isSubmitting || loading)}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
            <div className="w-[600px] h-20 grid grid-cols-3 gap-4">
              <div
                className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
                onClick={googleAuth}
              >
                <GoogleOutlined className="text-4xl text-green-500" />
                <h1 className="text-2xl font-hind">Google</h1>
              </div>
              <div
                className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
                onClick={facebookAuth}
              >
                <FacebookOutlined className="text-4xl text-blue-500" />
                <h1 className="text-2xl font-hind">Facebook</h1>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
