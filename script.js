const apiUrl = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api/2501-FTB-ET-WEB-PT/events';

const state = {
    allEvents: [],
    newEvent: {}
}

const currParties = document.querySelector("#event-list");  // This is where events will be rendered
const button = document.querySelector("#button");
const eventForm = document.querySelector("#event-form");

const render = (content) => {
    // Ensure currParties is used to append the events
    currParties.innerHTML = "";  // Clear current events before adding new ones

    if (Array.isArray(content)) {
        content.forEach((event) => {
            // Make sure event properties exist before trying to access them
            if (event.name && event.description && event.location && event.date) {
                const card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `
                    <h1>${event.name}</h1>
                    <p>${event.description}</p><br>
                    <p>${event.location}</p><br>
                    <p>${new Date(event.date).toLocaleString()}</p><br>
                    <button class="delete" data-id="${event.id}">Delete</button>
                `;
                currParties.appendChild(card);
            } else {
                console.error("Invalid event data", event);
            }
        });
    } else {
        // If content is not an array, handle it
        console.error("Expected an array of events but received", content);
    }
};

// Fetch the events from the API and render them
const getEvents = async () => {
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Log the response to check the structure of the API data
        console.log("API response data:", data);

        if (data && Array.isArray(data.data)) {
            // The events are inside data.data, not data.results
            state.allEvents = data.data;
            render(state.allEvents);
        } else {
            console.error("Error: 'data' is not an array or is empty in the API response", data);
        }
    } catch (error) {
        console.error("Error when fetching events", error);
    }
};

// Handle deleting events
const handleDeleteEvent = async (event) => {
    const button = event.target;
    if (button.classList.contains('delete')) {
        const eventId = button.dataset.id;
        try {
            const res = await fetch(`${apiUrl}/${eventId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                // Remove the deleted event from the state and re-render
                state.allEvents = state.allEvents.filter(ev => ev.id !== Number(eventId));
                render(state.allEvents);
            }
        } catch (error) {
            console.error("Error deleting event", error);
        }
    }
};

// Event listener for delete buttons
currParties.addEventListener('click', handleDeleteEvent);

// Event listener for form submission to add a new event
eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevent page reload on form submit

    // Get form data
    const eventName = document.querySelector("#event-name").value;
    const eventDescription = document.querySelector("#event-description").value;
    const eventDate = new Date(document.querySelector("#event-date").value).toISOString(); // Ensure ISO format
    const eventLocation = document.querySelector("#event-location").value;

    // Create a new event object
    const newEvent = {
        name: eventName,
        description: eventDescription,
        date: eventDate,
        location: eventLocation
    };

    // Log the new event data to the console for debugging
    console.log("New event data:", newEvent);

    try {
        // Send a POST request to the API to add the new event
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent)
        });

        // Log the response body for additional debugging
        const responseBody = await res.json();
        console.log("API response body:", responseBody);

        // Check if the POST request was successful
        if (res.ok) {
            // Clear the form after submitting
            eventForm.reset();
            
            // Fetch and render the updated event list
            getEvents();
        } else {
            console.error("Error adding event:", responseBody);
        }
    } catch (error) {
        console.error("Error with POST request:", error);
    }
});

// Load the events when the page loads
window.addEventListener('DOMContentLoaded', getEvents);