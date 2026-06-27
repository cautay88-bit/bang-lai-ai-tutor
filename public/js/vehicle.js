const Vehicle = {
  current: null,
  config: {
    oto: {
      id: "oto",
      label: "Ô tô",
      badge: "Hạng B",
      subtitle: "600 câu lý thuyết chính thức",
      bankLabel: "600 câu",
      hasSahinh: true,
      themeClass: "theme-oto"
    },
    moto: {
      id: "moto",
      label: "Mô tô",
      badge: "Hạng A1",
      subtitle: "250 câu lý thuyết chính thức",
      bankLabel: "250 câu",
      hasSahinh: false,
      themeClass: "theme-moto"
    }
  }
};

function getCurrentVehicle() {
  return Vehicle.current;
}

function getVehicleConfig(id) {
  return Vehicle.config[id || Vehicle.current];
}

function setCurrentVehicle(id) {
  Vehicle.current = id;
  document.body.classList.remove("theme-oto", "theme-moto");
  if (id) document.body.classList.add(Vehicle.config[id].themeClass);
  document.body.dataset.vehicle = id || "";
}

function isOtoMode() {
  return Vehicle.current === "oto";
}

function isMotoMode() {
  return Vehicle.current === "moto";
}
