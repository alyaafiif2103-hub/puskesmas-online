// app.js - Puskesmas Offline with localStorage + Enhanced Features
(function () {
  const STORAGE_KEY = 'puskesmas_antrian';

  // ===== Helper Functions =====
  function getEntries() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function setEntries(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function uid() {
    return 'id' + Date.now() + Math.floor(Math.random() * 900);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  // ============================
  // 1️⃣ FORM PENDAFTARAN – SIMPAN OTOMATIS KE RIWAYAT
  // ============================
  const form = document.getElementById('formAntrian');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nama = document.getElementById('nama').value.trim();
      const jk = document.getElementById('jk').value;
      const layanan = document.getElementById('layanan').value;
      const tanggal = document.getElementById('tanggal').value;
      const telepon = document.getElementById('telepon').value.trim();

      // ===== Tambahan baru =====
      const keluhan = document.getElementById('keluhan')?.value.trim() || "-";
      const berat = document.getElementById('berat')?.value.trim() || "-";
      const tinggi = document.getElementById('tinggi')?.value.trim() || "-";
      const pendaftaran = document.querySelector('input[name="pendaftaran"]:checked')?.value || "Offline";

      const entries = getEntries();
      const sameDay = entries.filter(en => en.tanggal === tanggal);
      const noAntrian = (sameDay.length + 1).toString().padStart(3, '0');

      const item = {
        id: uid(),
        noAntrian,
        nama,
        jk,
        layanan,
        tanggal,
        telepon,
        keluhan,       // ✅ ditambahkan
        berat,         // ✅ ditambahkan
        tinggi,        // ✅ ditambahkan
        pendaftaran,   // ✅ ditambahkan
        waktuDaftar: new Date().toISOString(),
        status: "Menunggu"
      };

      entries.push(item);
      setEntries(entries);

      sessionStorage.setItem("lastTicketId", item.id);
      window.location.href = "terimakasih.html";
    });
  }

  // ============================
  // 2️⃣ RIWAYAT ANTRIAN + SORTING
  // ============================
  function renderRiwayat() {
    const table = document.querySelector("#tblRiwayat tbody");
    if (!table) return;

    let entries = getEntries();

    // cek dropdown sort
    const sort = document.getElementById("sortRiwayat")?.value || "baru";

    if (sort === "baru") {
      entries.sort((a, b) => new Date(b.waktuDaftar) - new Date(a.waktuDaftar));
    } else if (sort === "lama") {
      entries.sort((a, b) => new Date(a.waktuDaftar) - new Date(b.waktuDaftar));
    } else if (sort === "kecil") {
      entries.sort((a, b) => Number(a.noAntrian) - Number(b.noAntrian));
    } else if (sort === "besar") {
      entries.sort((a, b) => Number(b.noAntrian) - Number(a.noAntrian));
    }

    table.innerHTML = "";

    if (entries.length === 0) {
      table.innerHTML = `
        <tr><td colspan="12" class="text-center text-muted">Belum ada riwayat</td></tr>
      `;
      return;
    }

    entries.forEach((it, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${it.noAntrian}</td>
        <td>${it.nama}</td>
        <td>${it.jk || "-"}</td>
        <td>${it.layanan}</td>
        <td>${it.keluhan || "-"}</td>      <!-- kolom keluhan -->
        <td>${it.berat || "-"}</td>        <!-- kolom berat -->
        <td>${it.tinggi || "-"}</td>       <!-- kolom tinggi -->
        <td>${it.pendaftaran || "-"}</td>  <!-- kolom jenis pendaftaran -->
        <td>${it.tanggal}</td>
        <td>${formatTime(it.waktuDaftar)}</td>
        <td>${it.status}</td>
      `;
      table.appendChild(tr);
    });
  }

  // ============================
  // Export CSV
  // ============================
  function exportCSV() {
    const entries = getEntries();
    if (!entries.length) {
      alert("Tidak ada data untuk diexport.");
      return;
    }

    const header = [
      "No",
      "NoAntrian",
      "Nama",
      "JK",
      "Layanan",
      "Keluhan",
      "Berat",
      "Tinggi",
      "Jenis Pendaftaran",
      "Tanggal",
      "WaktuDaftar",
      "Status"
    ];

    const rows = entries.map((it, i) => [
      i + 1,
      it.noAntrian,
      it.nama,
      it.jk,
      it.layanan,
      it.keluhan,
      it.berat,
      it.tinggi,
      it.pendaftaran,
      it.tanggal,
      it.waktuDaftar,
      it.status
    ]);

    const csv =
      [header, ...rows]
        .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "riwayat_antrian.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================
  // 3️⃣ ADMIN PANEL – STATUS REALTIME
  // ============================
  function renderAdminTable() {
    const tbody = document.querySelector("#tblAdmin tbody");
    if (!tbody) return;

    let entries = getEntries().sort(
      (a, b) => new Date(a.waktuDaftar) - new Date(b.waktuDaftar)
    );

    tbody.innerHTML = "";

    entries.forEach((it, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${it.noAntrian}</td>
        <td>${it.nama}</td>
        <td>${it.layanan}</td>
        <td>${it.keluhan || "-"}</td>
        <td>${it.berat || "-"}</td>
        <td>${it.tinggi || "-"}</td>
        <td>${it.pendaftaran || "-"}</td>
        <td>${it.tanggal}</td>
        <td>${formatTime(it.waktuDaftar)}</td>
        <td>
          <span class="badge ${
            it.status === "Selesai" ? "bg-success" :
            it.status === "Dipanggil" ? "bg-primary" : "bg-warning"
          }">
            ${it.status}
          </span>
        </td>
        <td></td> <!-- Kolom aksi kosong -->
      `;
      tbody.appendChild(tr);
    });
  }

  // ============================
  // Expose functions untuk dipanggil di HTML
  // ============================
  window.renderRiwayat = renderRiwayat;
  window.exportCSV = exportCSV;
  window.renderAdminTable = renderAdminTable;

  // ============================
  // Auto-render saat halaman siap
  // ============================
  document.addEventListener("DOMContentLoaded", () => {
    // halaman riwayat
    if (document.querySelector("#tblRiwayat tbody")) {
      const sortBox = document.getElementById("sortRiwayat");
      if (sortBox) sortBox.addEventListener("change", renderRiwayat);
      renderRiwayat();
    }

    // halaman admin
    if (document.querySelector("#tblAdmin tbody")) {
      renderAdminTable();
    }
  });

})();
