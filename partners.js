const partners = document.querySelectorAll(".partner");
const infoPanel = document.getElementById("infoPanel");
const infoName = document.getElementById("infoName");
const infoDesc = document.getElementById("infoDesc");

partners.forEach(partner => {
  partner.addEventListener("click", () => {
    const name = partner.dataset.name;
    const desc = partner.dataset.desc;

    partner.style.transition = "all 2.5s cubic-bezier(0.77, 0, 0.175, 1)";
    partner.style.transform = "translateY(200px) scale(0.8)";
    partner.style.zIndex = "1000";

    partners.forEach(p => {
      if (p !== partner) {
        p.style.transition = "all 2s ease-in";
        p.style.opacity = "0";
        p.style.transform = "translateY(300px) scale(0.5)";
      }
    });

    setTimeout(() => {
      infoName.textContent = name;
      infoDesc.textContent = desc;
      infoPanel.classList.remove("hidden");
      infoPanel.classList.add("show");
    }, 1800);
  });
});