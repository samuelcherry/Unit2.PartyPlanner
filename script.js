const COHORT = "2410-FTB-ET-WEB-FT";
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;

// === State ===

const state = {
  events: []
};

/** Updates state with artists from API */
async function getEvents() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    state.events = json.data;
  } catch (error) {
    console.error(error);
  }
}

/** Asks the API to create a new artist based on the given `artist` */
async function addEvents(event) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    const json = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    console.log("Event added:", json);
  } catch (error) {
    console.error(error);
  }
}

async function deleteEvents(event) {
  try {
    const response = await fetch(`${API_URL}/${event.id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      const json = await response.json().catch(() => null);

      if (json && json.error) {
        throw new Error(json.error.message);
      }
    }
    state.events = state.events.filter((e) => e.id !== event.id);
    render();
  } catch (error) {
    console.error(error);
  }
}

// === Render ===

/** Renders artists from state */
function renderEvents() {
  const eventList = document.querySelector("#events");

  if (!state.events.length) {
    eventList.innerHTML = "<li>No Events.</li>";
    return;
  }

  const eventCards = state.events.map((event) => {
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const card = document.createElement("li");
    card.innerHTML = `
    <h2>${event.name}</h2>
    <p>${event.description}</p>
    <p>${formattedDate}</p>
    <p>${event.location}</p>
    <button id="delete-btn" data-id="${event.id}">DELETE</button>
    `;

    const deleteButton = card.querySelector("#delete-btn");

    deleteButton.addEventListener("click", async () => {
      await deleteEvents(event);
      render();
    });

    return card;
  });

  eventList.replaceChildren(...eventCards);
}

/** Syncs state with the API and rerender */
async function render() {
  await getEvents();
  renderEvents();
}

// === Script ===

render();

const form = document.querySelector("form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newEvent = {
    name: form.eventName.value,
    description: form.description.value,
    date: new Date(form.date.value).toISOString(),
    location: form.location.value
  };

  await addEvents(newEvent);
  render();
});
