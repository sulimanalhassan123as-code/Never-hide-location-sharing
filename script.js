import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Your actual Supabase credentials
const supabaseUrl = "https://iebcbvlfdzudrinosshv.supabase.co";
const supabaseKey = "YOUR_KEY_HERE"; // paste your anon key here ✅
const supabase = createClient(supabaseUrl, supabaseKey);

const googleLoginBtn = document.getElementById("googleLogin");
const logoutBtn = document.getElementById("logout");
const userInfo = document.getElementById("userInfo");

// ✅ Login
googleLoginBtn.addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google"
  });
});

// ✅ Logout
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
});

// ✅ Auth state changes
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    userInfo.style.display = "block";
    logoutBtn.style.display = "inline-block";
    googleLoginBtn.style.display = "none";
    userInfo.textContent = "Logged as: " + session.user.email;
  } else {
    userInfo.style.display = "none";
    logoutBtn.style.display = "none";
    googleLoginBtn.style.display = "inline-block";
  }
});
