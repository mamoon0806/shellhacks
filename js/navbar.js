// JavaScript code
function openNav() {
    document.getElementById("mySidenav").style.left = "0";
    document.getElementById("homeButton").style.pointerEvents = "auto"; // Enable links
    document.getElementById("aboutButton").style.pointerEvents = "auto"; // Enable links
  }

  function closeNav() {
    document.getElementById("mySidenav").style.left = "-200px";
    document.getElementById("homeButton").style.pointerEvents = "none"; // Disable links
    document.getElementById("aboutButton").style.pointerEvents = "none"; // Disable links
  }

  function toggleNav() {
    const sidebar = document.getElementById("mySidenav");
    const sidebarLeft = window.getComputedStyle(sidebar).getPropertyValue("left");

    if (sidebarLeft === "0px") {
      closeNav();
    } else {
      openNav();
    }
  }