import { db } from "@/app/firebase/config";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";


const fetchHistory = async (appointment_id: string, doctorUID:string, patientUID:string) => {
    console.log("server side: ", appointment_id);
    console.log("server side: ", doctorUID);
    console.log("server side: ", patientUID);
    

   try{
    const docRef = collection(db, "appointment-history");
    const fieldAppointmentID = where("appointmentID", "==", appointment_id);
    const fieldDoctorUID =  where("doctorUID", "==", doctorUID);
    const fieldpatientUID = where("patientID", "==", patientUID)
    const q = query(docRef, fieldAppointmentID, fieldDoctorUID, fieldpatientUID, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q)

    const fetched = querySnapshot.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
    }))
    console.log("Backend", fetched);

    return fetched;
    

   }catch(error){
    console.log(error);
    return [];
   }
}

const fetchPatientInfo = async (appointment_ID: string, doctor_ID: string, patient_ID:string) => {
    try{
        const docRef = collection(db, "patient-info");
        const docField = where("doctor_ID", "==", doctor_ID);
        const appointmentField = where("appointment_ID", "==", appointment_ID);
        const patientField = where("patient_ID", "==", patient_ID);

        const q = query(docRef, appointmentField, docField, patientField);
        const docSnap = await getDocs(q);

        const fetched = docSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));
        return fetched;

    }catch(error){
        console.log(error);
        return []
    }
}

export default fetchHistory;

export {fetchPatientInfo}