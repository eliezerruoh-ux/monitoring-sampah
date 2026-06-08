// ======================================
// SISTEM MONITORING SAMPAH KOTAMOBAGU
// SCRIPT.JS FULL FIX GPS + MAP
// ======================================

// =======================
// DATA KELURAHAN
// =======================

const kelurahanData = {

  "Kotamobagu Timur": [
    "Kobo Besar",
    "Kobo Kecil",
    "Mogolaing",
    "Motoboi Kecil"
  ],

  "Kotamobagu Selatan": [
    "Pobundayan",
    "Mongkonai",
    "Motoboi Besar"
  ],

  "Kotamobagu Barat": [
    "Gogagoman",
    "Molinow",
    "Mogolaing"
  ],

  "Kotamobagu Utara": [
    "Biga",
    "Upai",
    "Bilalang"
  ]

};

// =======================
// ELEMENT
// =======================

const kecamatan =
  document.getElementById("kecamatan");

const kelurahan =
  document.getElementById("kelurahan");

const form =
  document.getElementById("reportForm");

const reportContainer =
  document.getElementById("reportContainer");

// =======================
// LOCAL STORAGE
// =======================

let reports =
  JSON.parse(localStorage.getItem("reports")) || [];

// =======================
// GPS
// =======================

let currentLat = null;
let currentLng = null;

// =======================
// MARKERS
// =======================

let markers = [];

// =======================
// DROPDOWN KELURAHAN
// =======================

kecamatan.addEventListener("change", () => {

  kelurahan.innerHTML =
    `<option value="">Pilih Kelurahan</option>`;

  kelurahanData[kecamatan.value].forEach(item => {

    kelurahan.innerHTML += `
      <option value="${item}">
        ${item}
      </option>
    `;

  });

});

// =======================
// MAP LEAFLET
// =======================

const map = L.map("map").setView(
  [0.7333, 124.3167],
  12
);

// =======================
// TILE MAP
// =======================

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      "&copy; OpenStreetMap"
  }
).addTo(map);

// =======================
// ICON STATUS
// =======================

function getMarkerByStatus(status){

  let iconUrl =
    "https://cdn-icons-png.flaticon.com/512/3096/3096673.png";

  // MERAH
  if(status === "Belum Diangkut"){

    iconUrl =
      "https://cdn-icons-png.flaticon.com/512/3096/3096673.png";

  }

  // KUNING
  if(
    status === "Dalam Perjalanan" ||
    status === "Sedang Diangkut"
  ){

    iconUrl =
      "https://cdn-icons-png.flaticon.com/512/1048/1048315.png";

  }

  // HIJAU
  if(status === "Selesai Diangkut"){

    iconUrl =
      "https://cdn-icons-png.flaticon.com/512/845/845646.png";

  }

  return L.icon({

    iconUrl: iconUrl,

    iconSize: [50,50],

    iconAnchor: [25,50],

    popupAnchor: [0,-40]

  });

}

// =======================
// GPS LOCATION
// =======================

async function getLocation(){

  // BROWSER SUPPORT
  if(!navigator.geolocation){

    alert("Browser tidak mendukung GPS");

    return;

  }

  navigator.geolocation.getCurrentPosition(

    // SUCCESS
    (position)=>{

      currentLat =
        position.coords.latitude;

      currentLng =
        position.coords.longitude;

      const kec =
        kecamatan.value || "";

      const kel =
        kelurahan.value || "";

      // INPUT LOKASI
      document.getElementById("lokasi").value =
        `${kec} - ${kel}`;

      // ZOOM MAP
      map.flyTo(
        [currentLat,currentLng],
        18
      );

      // HAPUS MARKER LAMA
      if(window.currentGPSMarker){

        map.removeLayer(
          window.currentGPSMarker
        );

      }

      // MARKER GPS
      window.currentGPSMarker = L.marker(

        [currentLat,currentLng],

        {
          icon:
            getMarkerByStatus(
              "Belum Diangkut"
            )
        }

      ).addTo(map);

      // POPUP
      window.currentGPSMarker.bindPopup(`

        <div style="font-family:Poppins;">

          <h3 style="color:#39FF14;">

            🗑 Titik Sampah

          </h3>

          <p>

            <b>Kecamatan:</b>

            ${kec}

          </p>

          <p>

            <b>Kelurahan:</b>

            ${kel}

          </p>

          <p>

            GPS berhasil terkoneksi

          </p>

        </div>

      `).openPopup();

      // AREA CIRCLE
      if(window.currentCircle){

        map.removeLayer(
          window.currentCircle
        );

      }

      window.currentCircle = L.circle(

        [currentLat,currentLng],

        {
          radius:100,
          color:"#39FF14",
          fillColor:"#39FF14",
          fillOpacity:0.2
        }

      ).addTo(map);

    },

    // ERROR
    (error)=>{

      alert("GPS gagal diakses");

      console.log(error);

    },

    // OPTIONS
    {
      enableHighAccuracy:true,
      timeout:10000,
      maximumAge:0
    }

  );

}

// =======================
// PREVIEW IMAGE
// =======================

function previewImage(input,previewId){

  input.addEventListener("change",()=>{

    const file = input.files[0];

    if(file){

      const reader =
        new FileReader();

      reader.onload = function(e){

        document.getElementById(previewId)
          .src = e.target.result;

      }

      reader.readAsDataURL(file);

    }

  });

}

// =======================
// PREVIEW ACTIVE
// =======================

previewImage(
  document.getElementById("foto"),
  "preview1"
);

previewImage(
  document.getElementById("before"),
  "preview2"
);

previewImage(
  document.getElementById("after"),
  "preview3"
);

// =======================
// FORM SUBMIT
// =======================

form.addEventListener("submit",(e)=>{

  e.preventDefault();

  // VALIDASI GPS
  if(currentLat === null){

    alert(
      "Silakan ambil lokasi GPS terlebih dahulu"
    );

    return;

  }

  const editIndex =
    document.getElementById("editIndex").value;

  // DATA REPORT
  const report = {

    nama:
      document.getElementById("nama").value,

    hp:
      document.getElementById("hp").value,

    kecamatan:
      kecamatan.value,

    kelurahan:
      kelurahan.value,

    alamat:
      document.getElementById("alamat").value,

    lokasi:
      document.getElementById("lokasi").value,

    jenis:
      document.getElementById("jenis").value,

    status:
      document.getElementById("status").value,

    deskripsi:
      document.getElementById("deskripsi").value,

    petugas:
      document.getElementById("petugas").value,

    kendaraan:
      document.getElementById("kendaraan").value,

    tanggal:
      new Date().toLocaleString(),

    lat:
      parseFloat(currentLat),

    lng:
      parseFloat(currentLng),

    foto:
      document.getElementById("preview1").src,

    before:
      document.getElementById("preview2").src,

    after:
      document.getElementById("preview3").src

  };

  // CREATE
  if(editIndex === ""){

    reports.push(report);

    alert(
      "Laporan berhasil ditambahkan"
    );

  }

  // UPDATE
  else{

    reports[editIndex] = report;

    alert(
      "Laporan berhasil diperbarui"
    );

  }

  // SAVE STORAGE
  localStorage.setItem(
    "reports",
    JSON.stringify(reports)
  );

  // RESET
  form.reset();

  document.getElementById("preview1")
    .src = "";

  document.getElementById("preview2")
    .src = "";

  document.getElementById("preview3")
    .src = "";

  document.getElementById("editIndex")
    .value = "";

  // RESET GPS
  currentLat = null;
  currentLng = null;

  // RENDER
  renderReports();

});

// =======================
// RENDER REPORTS
// =======================

function renderReports(){

  reportContainer.innerHTML = "";

  // HAPUS MARKER LAMA
  markers.forEach(marker=>{

    map.removeLayer(marker);

  });

  markers = [];

  reports.forEach((report,index)=>{

    let badgeClass = "red";

    if(
      report.status === "Dalam Perjalanan" ||
      report.status === "Sedang Diangkut"
    ){

      badgeClass = "yellow";

    }

    if(
      report.status === "Selesai Diangkut"
    ){

      badgeClass = "green";

    }

    // CARD
    reportContainer.innerHTML += `

      <div class="report-card">

        <img src="${report.foto}">

        <div class="report-content">

          <h3>

            ${report.nama}

          </h3>

          <p>

            📍
            ${report.kecamatan}
            -
            ${report.kelurahan}

          </p>

          <p>

            ${report.alamat}

          </p>

          <p>

            🕒
            ${report.tanggal}

          </p>

          <div class="badge ${badgeClass}">

            ${report.status}

          </div>

          <div class="action-btn">

            <button
              class="edit-btn"
              onclick="editReport(${index})"
            >
              Edit
            </button>

            <button
              class="delete-btn"
              onclick="deleteReport(${index})"
            >
              Hapus
            </button>

          </div>

        </div>

      </div>

    `;

    // MAP MARKER
    if(report.lat && report.lng){

      let marker = L.marker(

        [report.lat,report.lng],

        {
          icon:
            getMarkerByStatus(
              report.status
            )
        }

      ).addTo(map);

      // POPUP MAP
      marker.bindPopup(`

        <div style="width:220px;">

          <img
            src="${report.foto}"
            style="
              width:100%;
              border-radius:12px;
              margin-bottom:10px;
            "
          >

          <h3 style="color:#39FF14;">

            🗑 Laporan Sampah

          </h3>

          <p>

            <b>${report.nama}</b>

          </p>

          <p>

            ${report.kecamatan}
            -
            ${report.kelurahan}

          </p>

          <p>

            ${report.status}

          </p>

          <p>

            ${report.tanggal}

          </p>

        </div>

      `);

      markers.push(marker);

    }

  });

  updateStats();

  localStorage.setItem(
    "reports",
    JSON.stringify(reports)
  );

}

// =======================
// EDIT REPORT
// =======================

function editReport(index){

  const report = reports[index];

  document.getElementById("nama")
    .value = report.nama;

  document.getElementById("hp")
    .value = report.hp;

  kecamatan.value =
    report.kecamatan;

  kelurahan.innerHTML = "";

  kelurahanData[
    report.kecamatan
  ].forEach(item=>{

    kelurahan.innerHTML += `
      <option value="${item}">
        ${item}
      </option>
    `;

  });

  kelurahan.value =
    report.kelurahan;

  document.getElementById("alamat")
    .value = report.alamat;

  document.getElementById("lokasi")
    .value = report.lokasi;

  document.getElementById("jenis")
    .value = report.jenis;

  document.getElementById("status")
    .value = report.status;

  document.getElementById("deskripsi")
    .value = report.deskripsi;

  document.getElementById("petugas")
    .value = report.petugas;

  document.getElementById("kendaraan")
    .value = report.kendaraan;

  document.getElementById("preview1")
    .src = report.foto;

  document.getElementById("preview2")
    .src = report.before;

  document.getElementById("preview3")
    .src = report.after;

  currentLat = report.lat;
  currentLng = report.lng;

  document.getElementById("editIndex")
    .value = index;

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}

// =======================
// DELETE REPORT
// =======================

function deleteReport(index){

  const confirmDelete = confirm(
    "Yakin ingin menghapus laporan ini?"
  );

  if(confirmDelete){

    reports.splice(index,1);

    localStorage.setItem(
      "reports",
      JSON.stringify(reports)
    );

    renderReports();

    alert(
      "Laporan berhasil dihapus"
    );

  }

}

// =======================
// UPDATE STATISTIK
// =======================

function updateStats(){

  document.getElementById(
    "totalLaporan"
  ).innerText = reports.length;

  document.getElementById(
    "belum"
  ).innerText = reports.filter(

    r =>
      r.status ===
      "Belum Diangkut"

  ).length;

  document.getElementById(
    "diproses"
  ).innerText = reports.filter(

    r =>
      r.status ===
      "Sedang Diangkut"

  ).length;

  document.getElementById(
    "selesai"
  ).innerText = reports.filter(

    r =>
      r.status ===
      "Selesai Diangkut"

  ).length;

}

// =======================
// FILTER
// =======================

document
.getElementById("searchInput")
.addEventListener("input",filterData);

document
.getElementById("filterStatus")
.addEventListener("change",filterData);

document
.getElementById("filterWilayah")
.addEventListener("change",filterData);

function filterData(){

  const search =
    document.getElementById(
      "searchInput"
    ).value.toLowerCase();

  const status =
    document.getElementById(
      "filterStatus"
    ).value;

  const wilayah =
    document.getElementById(
      "filterWilayah"
    ).value;

  const cards =
    document.querySelectorAll(
      ".report-card"
    );

  cards.forEach((card,index)=>{

    const data = reports[index];

    const matchSearch =

      data.nama.toLowerCase()
      .includes(search)

      ||

      data.alamat.toLowerCase()
      .includes(search);

    const matchStatus =

      status === ""

      ||

      data.status === status;

    const matchWilayah =

      wilayah === ""

      ||

      data.kecamatan === wilayah;

    if(

      matchSearch &&
      matchStatus &&
      matchWilayah

    ){

      card.style.display = "block";

    }

    else{

      card.style.display = "none";

    }

  });

}

// =======================
// CHECK SERVICE
// =======================

function checkService(){

  const now = new Date();

  const day = now.getDay();

  const hour = now.getHours();

  const statusBox =
    document.getElementById(
      "statusBox"
    );

  if(

    day >= 1 &&
    day <= 5 &&
    hour >= 8 &&
    hour < 17

  ){

    statusBox.innerHTML =
      "🟢 Layanan Buka";

  }

  else{

    statusBox.innerHTML =
      "🔴 Layanan Tutup";

    document.getElementById("popup")
      .style.display = "flex";

  }

}

function closePopup(){

  document.getElementById("popup")
    .style.display = "none";

}

// =======================
// DIGITAL CLOCK
// =======================

function updateClock(){

  const now = new Date();

  document.getElementById("clock")
    .innerHTML =
      now.toLocaleTimeString();

}

setInterval(updateClock,1000);

// =======================
// SCROLL TOP
// =======================

function scrollToTop(){

  window.scrollTo({

    top:0,

    behavior:"smooth"

  });

}

// =======================
// WINDOW LOAD
// =======================

window.onload = ()=>{

  setTimeout(()=>{

    document.getElementById("loader")
      .style.display = "none";

  },2000);

  checkService();

  renderReports();

};