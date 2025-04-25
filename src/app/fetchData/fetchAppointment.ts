import { db } from "@/app/firebase/config";
import { doc, getDoc, getDocs, collection, where, query, updateDoc, Timestamp } from "firebase/firestore";
import fetchUserData from "./fetchUserData";



interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Timestamp | string | null; // ✅ Allow both Timestamp and string
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_DoctorUID?: string;
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
  Appointment_Time?: string;
  Appointment_TypeOfAppointment?: string;
}



const fetchAppointment = async () =>{
    try{
        const docRef = collection(db, "appointments");
        const querySnapshot = await getDocs(docRef);
        const appointments = querySnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));

        console.log(appointments);
        return appointments;
    }catch(err){
      console.log(err);
      
        return [];
    }
}

const fetchMyAppointment = async () =>{
    const data = await fetchUserData();
    const email = data[0]?.User_Email;
    const userUID = data[0]?.User_UID;
    console.log("My Appointment Dashboard Page ",userUID, email);
    
    

    try{
        const docRef = collection(db, "appointments");
        const q = query(docRef, where("Appointment_DoctorUID", "==", userUID));
        const querySnapshot = await getDocs(q);
        const myAppointments = querySnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));

        return myAppointments;
    }catch(err){
      console.log(err);

        return [];
    }
}

const fetchMyPatient = async () =>{
  const data = await fetchUserData();
  const email = data[0]?.User_Email;
  const userUID = data[0]?.User_UID;
  console.log("My Appointment Dashboard Page ",userUID, email);
  
  

  try{
      const docRef = collection(db, "appointments");
      const q = query(docRef, where("Appointment_DoctorUID", "==", userUID), where("Appointment_Status", "==", "Approved" ));
      const querySnapshot = await getDocs(q);
      const myAppointments = querySnapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data()
      }));

      return myAppointments;
  }catch(err){
    console.log(err);

      return [];
  }
}

const myNewPatient = async (doctorUID: string, doctorEmail: string) => {


    try {
      const patientsRef = collection(db, "appointments");
      const q = query(
        patientsRef,
        where("Appointment_DoctorUID", "==", doctorUID),
        where("Appointment_DoctorEmail", "==", doctorEmail)
      );
      const querySnapshot = await getDocs(q);
  
      let newPatientCount = 0;
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.Appointment_PatientUserUID && data.Appointment_IsNewPatient === true) {
             newPatientCount++; 
        }
      });
      return newPatientCount;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

const myOldPatient = async (doctorUID:string, doctorEmail:string) =>{
    try {
        const patientsRef = collection(db, "appointments");
        const q = query(
          patientsRef,
          where("Appointment_DoctorUID", "==", doctorUID),
          where("Appointment_DoctorEmail", "==", doctorEmail)
        );
        const querySnapshot = await getDocs(q);
    
        let newPatientCount = 0;
    
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.Appointment_PatientUserUID && data.Appointment_IsNewPatient === false) {
               newPatientCount++; 
          }
        });
        return newPatientCount;
      } catch (err) {
        console.log(err);

        return 0;
      }
}

const fetchPatientDetails = async (appointment_ID:string): Promise <Appointment | null>  =>  {
  

  try{
    const docRef = doc(db, "appointments", appointment_ID);
    const docSnap = await getDoc(docRef);


    if (docSnap.exists()) {
      return {id: docSnap.id, ...docSnap.data() as Appointment}
    }else{
      return null
    }
   
  }catch(error){
    console.log(error);
    return null;
  }
}


// const fetchProductById = async (id: string) => {
//     try {
//       const docRef = doc(db, "products", id); // Replace "products" with your collection name
//       const docSnap = await getDoc(docRef);

//       console.log("Product: ", docSnap);

//       if (docSnap.exists()) {
//         // Spread all fields into the Product type and update state
//         const fetchedProduct = { id: docSnap.id, ...docSnap.data() } as Product;
//         setProduct(fetchedProduct);
//         if (typeof fetchedProduct.Seller_PaymentMethod === "string") {
//           // If the features are stored as a string, split by comma and space to get the payment methods
//           setTypeOfPaymentArray(
//             fetchedProduct.Seller_PaymentMethod.split(", ")
//           );
//         } else {
//           // Fallback if it's already an array or null
//           setTypeOfPaymentArray(fetchedProduct.Seller_PaymentMethod || null);
//         }
//       } else {
//         setProduct(null);
//       }
//     } catch (error) {
//       console.error("Error fetching product:", error);
//       setProduct(null);
//     }
//   };


const postApprovedAppointment = async (appointment_ID:string, time: string) =>{
  console.log("Appointment ID ", appointment_ID);
  
  try{
    if (!appointment_ID ) {
      throw new Error("Invalid appointment ID");
    }

    const docRef = doc(db, "appointments", appointment_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const updated = await updateDoc(docRef, {
        Appointment_Status: "Approved",
        Appointment_Time: time,
      });
      return updated;
    } else {
      throw new Error("Document does not exist");
    }
  }
  catch(error){
    console.log(error);
    
  }

}

// const fetchLive = async (
//   appointment_id: string,
//   callback: (appointment: Appointment | null) => void
// ) => {
//   if (!appointment_id) {
//     console.error("Invalid appointment ID.");
//     return;
//   }

//   const docRef = doc(db, "appointments", appointment_id);

//   const unsubscribe = onSnapshot(
//     docRef,
//     (docSnap) => {
//       if (docSnap.exists()) {
//         const appointmentData = docSnap.data() as Appointment;
//         callback(appointmentData);
//       } else {
//         callback(null); // ✅ Now explicitly allowing null
//       }
//     },
//     (error) => {
//       console.error("Error fetching appointment:", error);
//     }
//   );

//   return unsubscribe;
// };

const postApprovedNotification = async (notification_UID:string) => {
  try{
    if(!notification_UID){
      throw ( "Notification UID render is bad");
    }

    const notifRef = doc(db, "notifications", notification_UID);
    const notifSnap = await getDoc(notifRef);

    if(notifSnap.exists()){
      const updateNotif = await updateDoc(notifRef,{
        isApprove: true,
      })

      return updateNotif;
    }
  }catch(err){
    console.log(err);
    
  }
}

const postPaidAppointment = async (appointmentID:string) => {
  try{
    if(!appointmentID) throw ("Appointment ID is not good");

    const appointmentRef = doc(db, "appointments", appointmentID);
    const appointmentSnap = await getDoc(appointmentRef);

    if(appointmentSnap.exists()){
      const paidAppointment = await updateDoc(appointmentRef, {
        Appointment_isPaid: true
      })
      return paidAppointment;
    }

  }catch(error){
    console.log(error);
    return null;
  }
}


// import { doc, onSnapshot, Timestamp } from "firebase/firestore";
// import { db } from "@/app/firebase/config";


// const fetchIDAppointment = async (
//   appointment_id: string,
//   callback: (appointment: Appointment | null) => void
// ) => {
//   if (!appointment_id) {
//     console.error("Invalid appointment ID.");
//     return;
//   }

//   const docRef = doc(db, "appointments", appointment_id);

//   const unsubscribe = onSnapshot(
//     docRef,
//     (docSnap) => {
//       if (docSnap.exists()) {
//         const appointmentData = docSnap.data() as Appointment;
//         callback(appointmentData);
//       } else {
//         callback(null); // ✅ Now explicitly allowing null
//       }
//     },
//     (error) => {
//       console.error("Error fetching appointment:", error);
//     }
//   );

//   return unsubscribe;
// };


export default fetchAppointment;

export {fetchMyAppointment, myNewPatient, myOldPatient, fetchPatientDetails, postApprovedAppointment, postApprovedNotification, fetchMyPatient, postPaidAppointment};