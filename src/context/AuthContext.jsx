import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ADMIN_EMAILS } from "./authConstants";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) { 
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("student");

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    const role = ADMIN_EMAILS.includes(u.email) ? "admin" : "student";

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid,
        email: u.email,
        name: u.displayName,
        photoURL: u.photoURL,
        role: role,
        createdAt: serverTimestamp(),
      });
    } else {
       await setDoc(ref, { role: role }, { merge: true });
  }

    // Set active role on login
    setActiveRole(role);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setActiveRole("student");
  };

  // Switch between admin and visitor mode
  const switchToAdmin = () => setActiveRole("admin");
  const switchToVisitor = () => setActiveRole("student");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const profile = snap.data();
          setUser(u);
          setUserProfile(profile);
          setActiveRole(profile.role); // ← add this line
          } else {
          setUser(u);
          setUserProfile({ role: "student" });
          setActiveRole("student");
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setActiveRole("student");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      activeRole,
      switchToAdmin,   // ✅ switch to admin mode
      switchToVisitor, // ✅ switch to visitor mode
      signInWithGoogle,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}