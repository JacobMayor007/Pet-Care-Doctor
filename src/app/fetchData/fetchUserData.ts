import { signInWithEmailAndPassword,getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, where, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../firebase/config";
import { app } from "@/app/firebase/config";

const fetchUserData = async (): Promise<DocumentData[]> => {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userEmail = user.email;
          const userUID = user.uid;
          // Query the Users collection with both conditions
          const userQuery = query(
            collection(db, "Users"),
            where("User_Email", "==", userEmail),
            where("User_UID", "==", userUID)
          );

          // Execute the query
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Extract all fields for the matching document(s)
            const userData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            resolve(userData);
            return userData;
          } else {
            console.log("No matching user found.");
            resolve([]);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          reject(error);
        }
      } else {
        console.log("No user is signed in.");
        resolve([]);
      }
    });
  });
};




const signingIn = async (email:string, password:string) => {
        try{
        const auth = getAuth(app);

        await signInWithEmailAndPassword(auth, email, password);
        return true;
        
    }catch(error){
        console.error(error);
        return false
    }

}

const isAuthenticate = ()=> {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Clean up listener
      resolve(!!user); // Resolve true if a user exists, false otherwise
    });
  });
}


export {signingIn, isAuthenticate}

export default fetchUserData;
