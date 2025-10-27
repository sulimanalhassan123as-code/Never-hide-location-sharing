const supabaseUrl = "https://iebcbvlfdzudrinosshv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllYmNidmxmZHp1ZHJpbm9zc2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDg5NTMsImV4cCI6MjA3NzA4NDk1M30.6-XwuwryT84txvbY-_T_e7FlzhexU_Bl75azzSmVJfA";

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const signinBtn = document.getElementById('signin');
const signoutBtn = document.getElementById('signout');
const meSpan = document.getElementById('me');
const controls = document.getElementById('controls');
const shareToggle = document.getElementById('shareToggle');
const locationsList = document.getElementById('locationsList');

let uid = null;
let shareInterval = null;

signinBtn.onclick = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  });
  if (error) alert(error.message);
};

signoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  uid = null;
  stopSharing();
};

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    uid = session.user.id;
    meSpan.textContent = session.user.email;
    signinBtn.style.display = 'none';
    signoutBtn.style.display = 'inline-block';
    controls.style.display = 'block';
    listenLocations();
  } else {
    signinBtn.style.display = 'inline-block';
    signoutBtn.style.display = 'none';
    controls.style.display = 'none';
    locationsList.innerHTML = 'Not signed in';
  }
});

shareToggle.onchange = () => {
  if (shareToggle.checked) startSharing();
  else stopSharing();
};

function startSharing() {
  if (!navigator.geolocation) return alert("Location not supported!");
  updateLoc();
  shareInterval = setInterval(updateLoc, 8000);
}

function stopSharing() {
  if (shareInterval) clearInterval(shareInterval);
  if (!uid) return;
  supabase.from("locations").delete().eq("id", uid);
}

function updateLoc() {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    await supabase.from("locations")
      .upsert({ id: uid, lat: latitude, lon: longitude });
  });
}

function listenLocations() {
  supabase
    .channel('loc')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' },
      loadLocations
    ).subscribe();

  loadLocations();
}

async function loadLocations() {
  const { data } = await supabase.from("locations").select("*");
  if (!data.length) return locationsList.textContent = "No users sharing yet.";
  locationsList.innerHTML = "";
  data.forEach(u => {
    const d = document.createElement('div');
    d.textContent = `User: ${u.id} | Lat: ${u.lat.toFixed(5)} | Lon: ${u.lon.toFixed(5)}`;
    locationsList.appendChild(d);
  });
                   }
