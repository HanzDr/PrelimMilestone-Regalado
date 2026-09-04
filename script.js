"use strict";

/* =========================
   CONSTANTS
========================= */

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


/* =========================
   STATE
========================= */

const state = {
  projects: [...FEATURED_PROJECTS],
  currentPage: 1,
  searchTerm: "",
  bookmarksOnly: false,
  bookmarks: getBookmarks(),
};


/* =========================
   DOM ELEMENTS
========================= */

const elements = {
  navToggle: document.querySelector(".nav-toggle"),
  navLinks: document.querySelector(".nav-links"),

  projectGrid: document.querySelector("#project-grid"),
  searchInput: document.querySelector("#project-search"),
  bookmarksOnlyInput: document.querySelector("#bookmarks-only"),
  projectStatus: document.querySelector("#project-status"),
  pagination: document.querySelector("#pagination"),

  contactForm: document.querySelector("#contact-form"),
  formStatus: document.querySelector("#form-status"),
};


/* =========================
   INITIALIZATION
========================= */

function init() {
  setCurrentYear();

  setupNavigation();
  setupProjectEvents();
  setupContactForm();

  renderPage();
  fetchProjects();
}


/* =========================
   MAIN RENDER FUNCTION
========================= */

function renderPage() {
  clearPage();

  renderProjects();
  renderPagination();
}


/* =========================
   CLEAN PAGE
========================= */

function clearPage() {
  if (elements.projectGrid) {
    elements.projectGrid.replaceChildren();
  }

  if (elements.pagination) {
    elements.pagination.replaceChildren();
  }
}


/* =========================
   STATE HELPERS
========================= */

function setSearchTerm(value) {
  state.searchTerm = value.trim().toLowerCase();
  state.currentPage = 1;

  renderPage();
}

function setBookmarksOnly(value) {
  state.bookmarksOnly = value;
  state.currentPage = 1;

  renderPage();
}

function setCurrentPage(page) {
  state.currentPage = page;

  renderPage();
}

function toggleBookmark(projectId) {
  if (state.bookmarks.has(projectId)) {
    state.bookmarks.delete(projectId);
  } else {
    state.bookmarks.add(projectId);
  }

  saveBookmarks(state.bookmarks);

  renderPage();
}

function setProjects(projects) {
  state.projects = projects;

  renderPage();
}


/* =========================
   LOCAL STORAGE HELPERS
========================= */

function getBookmarks() {
  try {
    return new Set(
      JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []
    );
  } catch {
    return new Set();
  }
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(
    BOOKMARK_KEY,
    JSON.stringify([...bookmarks])
  );
}


/* =========================
   PROJECT SELECTORS
========================= */

function getFilteredProjects() {
  return state.projects.filter((project) => {
    const matchesSearch =
      project.name
        .toLowerCase()
        .includes(state.searchTerm);

    const matchesBookmark =
      !state.bookmarksOnly ||
      state.bookmarks.has(project.id);

    return matchesSearch && matchesBookmark;
  });
}

function getPageCount() {
  const projects = getFilteredProjects();

  return Math.ceil(
    projects.length / PROJECTS_PER_PAGE
  );
}

function getVisibleProjects() {
  const projects = getFilteredProjects();

  const pageCount = getPageCount();

  // Prevent invalid page numbers
  if (state.currentPage > Math.max(pageCount, 1)) {
    state.currentPage = 1;
  }

  const start =
    (state.currentPage - 1) *
    PROJECTS_PER_PAGE;

  return projects.slice(
    start,
    start + PROJECTS_PER_PAGE
  );
}


/* =========================
   PROJECT RENDERING
========================= */

function renderProjects() {
  if (!elements.projectGrid) return;

  const projects = getVisibleProjects();

  if (!projects.length) {
    renderEmptyState();
    return;
  }

  projects.forEach((project) => {
    const card = createProjectCard(project);

    elements.projectGrid.append(card);
  });
}

function renderEmptyState() {
  const message = document.createElement("p");

  message.className = "empty-state";

  message.textContent =
    "No projects match your search or bookmark filter.";

  elements.projectGrid.append(message);
}


/* =========================
   PROJECT CARD
========================= */

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const title = document.createElement("h3");
  title.textContent = project.name;

  const description = document.createElement("p");
  description.textContent =
    project.description ||
    "No description has been added to this repository yet.";

  const meta = createProjectMeta(project);

  const actions = createProjectActions(project);

  article.append(
    title,
    description,
    meta,
    actions
  );

  return article;
}


/* =========================
   PROJECT META
========================= */

function createProjectMeta(project) {
  const meta = document.createElement("div");

  meta.className = "project-meta";

  const language = document.createElement("span");

  language.textContent =
    project.language || "Code";

  meta.append(language);

  if (
    project.stargazers_count > 0 ||
    !project.linkLabel
  ) {
    const stars = document.createElement("span");

    stars.textContent =
      `★ ${project.stargazers_count}`;

    meta.append(stars);
  }

  return meta;
}


/* =========================
   PROJECT ACTIONS
========================= */

function createProjectActions(project) {
  const actions = document.createElement("div");

  actions.className = "card-actions";

  const primaryAction =
    createPrimaryAction(project);

  const bookmarkButton =
    createBookmarkButton(project);

  actions.append(
    primaryAction,
    bookmarkButton
  );

  return actions;
}

function createPrimaryAction(project) {
  if (project.html_url) {
    const link = document.createElement("a");

    link.className = "project-link";
    link.href = project.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.textContent =
      project.linkLabel ||
      "View repository ↗";

    return link;
  }

  const status = document.createElement("span");

  status.className = "project-status-tag";

  status.textContent =
    project.status || "Unavailable";

  return status;
}


/* =========================
   BOOKMARK BUTTON
========================= */

function createBookmarkButton(project) {
  const button = document.createElement("button");

  button.type = "button";

  button.className = "bookmark-button";

  const isSaved =
    state.bookmarks.has(project.id);

  button.classList.toggle(
    "active",
    isSaved
  );

  button.setAttribute(
    "aria-pressed",
    String(isSaved)
  );

  button.setAttribute(
    "aria-label",
    `${isSaved ? "Remove" : "Add"} ${project.name} ${
      isSaved ? "from" : "to"
    } bookmarks`
  );

  button.textContent =
    isSaved ? "★ Saved" : "☆ Save";

  button.addEventListener("click", () => {
    toggleBookmark(project.id);
  });

  return button;
}


/* =========================
   PAGINATION
========================= */

function renderPagination() {
  if (!elements.pagination) return;

  const pageCount = getPageCount();

  if (pageCount <= 1) return;

  for (
    let page = 1;
    page <= pageCount;
    page += 1
  ) {
    const button =
      document.createElement("button");

    button.type = "button";

    button.textContent =
      String(page);

    button.setAttribute(
      "aria-label",
      `Go to projects page ${page}`
    );

    if (page === state.currentPage) {
      button.setAttribute(
        "aria-current",
        "page"
      );
    }

    button.addEventListener("click", () => {
      setCurrentPage(page);

      elements.projectGrid?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    elements.pagination.append(button);
  }
}


/* =========================
   PROJECT EVENTS
========================= */

function setupProjectEvents() {
  if (elements.searchInput) {
    elements.searchInput.addEventListener(
      "input",
      (event) => {
        setSearchTerm(event.target.value);
      }
    );
  }

  if (elements.bookmarksOnlyInput) {
    elements.bookmarksOnlyInput.addEventListener(
      "change",
      (event) => {
        setBookmarksOnly(event.target.checked);
      }
    );
  }
}


/* =========================
   FETCH PROJECTS
========================= */

async function fetchProjects() {
  if (!elements.projectStatus) return;

  try {
    const response = await fetch(
      "https://api.github.com/users/HanzDr/repos?per_page=10"
    );

    if (!response.ok) {
      throw new Error(
        `GitHub returned status ${response.status}`
      );
    }

    const projects = await response.json();

    // If API returns nothing, use fallback data
    if (!projects || projects.length === 0) {
      setProjects([...FEATURED_PROJECTS]);

      elements.projectStatus.textContent =
        "No projects found. Showing featured projects instead.";

      return;
    }

    // Use fetched projects
    setProjects(projects);

    elements.projectStatus.hidden = true;

  } catch (error) {
    console.error(
      "Unable to load GitHub projects:",
      error
    );

    // Use fallback data if fetch fails
    setProjects([...FEATURED_PROJECTS]);

    elements.projectStatus.hidden = false;
    elements.projectStatus.classList.add("error");

    elements.projectStatus.textContent =
      "Unable to load projects from GitHub. Showing featured projects instead.";
  }
}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {
  const {
    navToggle,
    navLinks,
  } = elements;

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener("click", () => {
    const isOpen =
      navLinks.classList.toggle("open");

    navToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });
}


/* =========================
   CURRENT YEAR
========================= */

function setCurrentYear() {
  document
    .querySelectorAll("[data-current-year]")
    .forEach((element) => {
      element.textContent =
        new Date().getFullYear();
    });
}


/* =========================
   FORM VALIDATION
========================= */

const PH_PHONE_PATTERN =
  /^(?:\+63|0)9\d{9}$/;

function validateContactForm(form) {
  const fields = [
    ...form.querySelectorAll("input, textarea"),
  ];

  const results =
    fields.map((field) => validateField(form, field));

  return results.every(Boolean);
}

function validateField(form, field) {
  let message = "";

  if (field.validity.valueMissing) {
    message = "This field is required.";

  } else if (field.validity.typeMismatch) {
    message =
      "Please enter a valid email address.";

  } else if (field.validity.tooShort) {
    message =
      `Please enter at least ${field.minLength} characters.`;

  } else if (
    field.id === "phone" &&
    !PH_PHONE_PATTERN.test(
      field.value.replace(/[\s-]/g, "")
    )
  ) {
    message =
      "Enter a valid PH mobile number, such as 09171234567.";
  }

  setFieldError(form, field, message);

  return !message;
}

function setFieldError(
  form,
  field,
  message
) {
  field.setAttribute(
    "aria-invalid",
    String(Boolean(message))
  );

  const error =
    form.querySelector(
      `[data-error-for="${field.id}"]`
    );

  if (error) {
    error.textContent = message;
  }
}

function clearFormErrors(form) {
  const fields =
    form.querySelectorAll("input, textarea");

  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");

    const error =
      form.querySelector(
        `[data-error-for="${field.id}"]`
      );

    if (error) {
      error.textContent = "";
    }
  });
}


/* =========================
   CONTACT FORM EVENTS
========================= */

function setupContactForm() {
  const {
    contactForm,
    formStatus,
  } = elements;

  if (!contactForm || !formStatus) return;

  const fields = [
    ...contactForm.querySelectorAll(
      "input, textarea"
    ),
  ];

  // Validate individual fields on blur
  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      validateField(contactForm, field);
    });
  });

  contactForm.addEventListener(
    "submit",
    handleFormSubmit
  );
}

function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const formStatus =
    elements.formStatus;

  formStatus.textContent = "";

  formStatus.className =
    "form-status";

  const isValid =
    validateContactForm(form);

  if (!isValid) {
    formStatus.textContent =
      "Please correct the highlighted fields.";

    form
      .querySelector('[aria-invalid="true"]')
      ?.focus();

    return;
  }

  formStatus.textContent =
    "Thanks! Your message passed validation and is ready to send.";

  formStatus.classList.add(
    "success"
  );

  form.reset();

  clearFormErrors(form);
}


/* =========================
   START APPLICATION
========================= */

init();