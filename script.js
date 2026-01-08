// Simpan data dari daftar.html ke session
const form = document.getElementById("formDaftar");

if (form) {
    form.addEventListener("submit", function(e){
        e.preventDefault();

        const data = {
            nama: document.getElementById("nama").value,
            hp: document.getElementById("hp").value,
            poli: document.getElementById("poli").value,
            tanggal: new Date().toLocaleString()
        };

        sessionStorage.setItem("pendaftaran", JSON.stringify(data));
        window.location.href = "pembayaran.html";
    });
}

// Tampilkan detail pembayaran
if (window.location.pathname.includes("pembayaran.html")) {
    const data = JSON.parse(sessionStorage.getItem("pendaftaran"));

    const tarif = {
        "Poli Umum": 25000,
        "Poli Gigi": 30000,
        "Poli Anak": 20000,
        "Poli Mata": 40000,
        "Laboratorium": 50000
    };

    document.getElementById("detailPembayaran").innerHTML = `
        <p><b>Nama:</b> ${data.nama}</p>
        <p><b>No HP:</b> ${data.hp}</p>
        <p><b>Poli:</b> ${data.poli}</p>
        <p><b>Biaya:</b> <span class="text-success">Rp ${tarif[data.poli].toLocaleString()}</span></p>
    `;
}

// Selesai bayar
function selesaiBayar() {
    const data = JSON.parse(sessionStorage.getItem("pendaftaran"));

    let riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];
    riwayat.push(data);
    localStorage.setItem("riwayat", JSON.stringify(riwayat));

    window.location.href = "selesai.html";
}

// Riwayat
if (window.location.pathname.includes("riwayat.html")) {
    const data = JSON.parse(localStorage.getItem("riwayat")) || [];
    let html = "";

    data.forEach((item, i) => {
        html += `
        <tr>
          <td>${i + 1}</td>
          <td>${item.nama}</td>
          <td>${item.hp}</td>
          <td>${item.poli}</td>
          <td>${item.tanggal}</td>
        </tr>`;
    });

    document.getElementById("dataRiwayat").innerHTML = html;
}
