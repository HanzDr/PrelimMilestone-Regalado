"use strict";

const PROJECTS_PER_PAGE = 6;
const BOOKMARK_KEY = "portfolio-project-bookmarks";
const FEATURED_PROJECTS = [
  {
    id: "live-samahan-website-2026",
    name: "Samahan Website 2026",
    description:
      "The official SAMAHAN website for 2026 at Ateneo de Davao University.",
    language: "Live Website",
    stargazers_count: 0,
    html_url: "https://samahan.addu.edu.ph/",
    linkLabel: "Visit website ↗",
  },
  {
    id: "live-ufest-palaro-2025",
    name: "Ufest Palaro 2025",
    description:
      "The official Duyog 2025 UFest Palaro website at Ateneo de Davao University.",
    language: "Live Website",
    stargazers_count: 0,
    html_url: "https://duyog2025.addu.edu.ph/",
    linkLabel: "Visit website ↗",
  },
  {
    id: "live-pycon-davao",
    name: "PyCon Davao",
    description:
      "Contributed to the PyCon Davao website as a Frontend Developer.",
    language: "Frontend Development",
    stargazers_count: 0,
    html_url: "https://pycon-davao.durianpy.org/",
    linkLabel: "Visit website",
  },
  {
    id: "live-mh-telematics",
    name: "MHE Telematics",
    description:
      "Worked on the MHE Telematics website as a Full-Stack Developer during my internship.",
    language: "Full-Stack Development",
    stargazers_count: 0,
    html_url: "https://www.mhetelematics.com/",
    linkLabel: "Visit website",
  },
  {
    id: "cateneo-in-progress",
    name: "Cateneo",
    description:
      "A Cat Directory for Cateneo a University Organization with Ateneo de Davao University. Currently working on Cateneo as a Full-Stack Developer.",
    language: "Full-Stack Development",
    stargazers_count: 0,
    status: "In Progress",
  },
];

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const projectGrid = document.querySelector("#project-grid");

if (projectGrid) {
  const searchInput = document.querySelector("#project-search");
  const bookmarksOnlyInput = document.querySelector("#bookmarks-only");
  const status = document.querySelector("#project-status");
  const pagination = document.querySelector("#pagination");
  let projects = [...FEATURED_PROJECTS];
  let currentPage = 1;

  const getBookmarks = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []);
    } catch {
      return new Set();
    }
  };

  const saveBookmarks = (bookmarks) => {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...bookmarks]));
  };

  const filteredProjects = () => {
    const term = searchInput.value.trim().toLowerCase();
    const bookmarks = getBookmarks();
    return projects.filter((project) => {
      const matchesName = project.name.toLowerCase().includes(term);
      const matchesBookmark =
        !bookmarksOnlyInput.checked || bookmarks.has(project.id);
      return matchesName && matchesBookmark;
    });
  };

  const createProjectCard = (project) => {
    const article = document.createElement("article");
    article.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = project.name;

    const description = document.createElement("p");
    description.textContent =
      project.description ||
      "No description has been added to this repository yet.";

    const meta = document.createElement("div");
    meta.className = "project-meta";
    const language = document.createElement("span");
    language.textContent = project.language || "Code";
    meta.append(language);
    if (project.stargazers_count > 0 || !project.linkLabel) {
      const stars = document.createElement("span");
      stars.textContent = `★ ${project.stargazers_count}`;
      meta.append(stars);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";
    let primaryAction;
    if (project.html_url) {
      const link = document.createElement("a");
      link.className = "project-link";
      link.href = project.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = project.linkLabel || "View repository ↗";
      primaryAction = link;
    } else {
      const projectStatus = document.createElement("span");
      projectStatus.className = "project-status-tag";
      projectStatus.textContent = project.status || "Unavailable";
      primaryAction = projectStatus;
    }

    const bookmark = document.createElement("button");
    bookmark.type = "button";
    bookmark.className = "bookmark-button";
    const updateBookmarkButton = () => {
      const saved = getBookmarks().has(project.id);
      bookmark.classList.toggle("active", saved);
      bookmark.setAttribute("aria-pressed", String(saved));
      bookmark.setAttribute(
        "aria-label",
        `${saved ? "Remove" : "Add"} ${project.name} ${saved ? "from" : "to"} bookmarks`,
      );
      bookmark.textContent = saved ? "★ Saved" : "☆ Save";
    };
    bookmark.addEventListener("click", () => {
      const saved = getBookmarks();
      saved.has(project.id) ? saved.delete(project.id) : saved.add(project.id);
      saveBookmarks(saved);
      updateBookmarkButton();
      if (bookmarksOnlyInput.checked) renderProjects();
    });
    updateBookmarkButton();
    actions.append(primaryAction, bookmark);
    article.append(title, description, meta, actions);
    return article;
  };

  const renderPagination = (pageCount) => {
    pagination.replaceChildren();
    if (pageCount <= 1) return;
    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Go to projects page ${page}`);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => {
        currentPage = page;
        renderProjects();
        projectGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      pagination.append(button);
    }
  };

  const renderProjects = () => {
    // Begin every render with a clean DOM state. replaceChildren() clears the
    // parent safely without parsing HTML strings or using innerHTML.
    projectGrid.replaceChildren();
    pagination.replaceChildren();

    const matches = filteredProjects();
    const pageCount = Math.ceil(matches.length / PROJECTS_PER_PAGE);
    if (currentPage > Math.max(pageCount, 1)) currentPage = 1;
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    const visibleProjects = matches.slice(start, start + PROJECTS_PER_PAGE);
    if (!visibleProjects.length) {
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent = "No projects match your search or bookmark filter.";
      projectGrid.append(message);
    } else {
      visibleProjects.forEach((project) =>
        projectGrid.append(createProjectCard(project)),
      );
    }
    renderPagination(pageCount);
  };

  const fetchProjects = async () => {
    try {
      const domains = "samahan.addu.edu.ph duyog2025.addu.edu.ph";
      const query = encodeURIComponent(`${domains} in:readme,description`);
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${query}&per_page=10`,
      );
      if (!response.ok)
        throw new Error(`GitHub returned status ${response.status}`);
      await response.json();
      status.hidden = true;
      renderProjects();
    } catch (error) {
      console.error("Unable to load GitHub projects:", error);
      projects = [...FEATURED_PROJECTS];
      renderProjects();
      status.classList.add("error");
      status.replaceChildren();
      const message = document.createElement("span");
      message.textContent =
        "The live websites are available, but their GitHub API details could not be checked right now.";
      status.append(message);
    }
  };

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderProjects();
  });
  bookmarksOnlyInput.addEventListener("change", () => {
    currentPage = 1;
    renderProjects();
  });
  fetchProjects();
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const formStatus = document.querySelector("#form-status");
  const fields = [...contactForm.querySelectorAll("input, textarea")];
  const phPhonePattern = /^(?:\+63|0)9\d{9}$/;

  const setError = (field, message) => {
    field.setAttribute("aria-invalid", String(Boolean(message)));
    const error = contactForm.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = message;
  };

  const validateField = (field) => {
    let message = "";
    if (field.validity.valueMissing) message = "This field is required.";
    else if (field.validity.typeMismatch)
      message = "Please enter a valid email address.";
    else if (field.validity.tooShort)
      message = `Please enter at least ${field.minLength} characters.`;
    else if (
      field.id === "phone" &&
      !phPhonePattern.test(field.value.replace(/[\s-]/g, ""))
    )
      message = "Enter a valid PH mobile number, such as 09171234567.";
    setError(field, message);
    return !message;
  };

  fields.forEach((field) =>
    field.addEventListener("blur", () => validateField(field)),
  );
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.className = "form-status";
    const isValid = fields.map(validateField).every(Boolean);
    if (!isValid) {
      formStatus.textContent = "Please correct the highlighted fields.";
      contactForm.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    formStatus.textContent =
      "Thanks! Your message passed validation and is ready to send.";
    formStatus.classList.add("success");
    contactForm.reset();
    fields.forEach((field) => field.removeAttribute("aria-invalid"));
  });
}
