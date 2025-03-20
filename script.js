const apiUrl = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api/2501-FTB-ET-WEB-PT/events';

const state = {
    allEvents: [],
    newEvent: {}
}

const currParties = document.querySelector("#event-list");  
const button = document.querySelector("#button");
const eventForm = document.querySelector("#event-form");

const render = (content) => {
   
    currParties.innerHTML = "";  

    if (Array.isArray(content)) {
        content.forEach((event) => {
            
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

        
        console.log("API response data:", data);

        if (data && Array.isArray(data.data)) {
            
            state.allEvents = data.data;
            render(state.allEvents);
        } else {
            console.error("Error: 'data' is not an array or is empty in the API response", data);
        }
    } catch (error) {
        console.error("Error when fetching events", error);
    }
};


const handleDeleteEvent = async (event) => {
    const button = event.target;
    if (button.classList.contains('delete')) {
        const eventId = button.dataset.id;
        try {
            const res = await fetch(`${apiUrl}/${eventId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                
                state.allEvents = state.allEvents.filter(ev => ev.id !== Number(eventId));
                render(state.allEvents);
            }
        } catch (error) {
            console.error("Error deleting event", error);
        }
    }
};


currParties.addEventListener('click', handleDeleteEvent);


eventForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    // Get form data
    const eventName = document.querySelector("#event-name").value;
    const eventDescription = document.querySelector("#event-description").value;
    const eventDate = new Date(document.querySelector("#event-date").value).toISOString(); 
    const eventLocation = document.querySelector("#event-location").value;

    
    const newEvent = {
        name: eventName,
        description: eventDescription,
        date: eventDate,
        location: eventLocation
    };

    
    console.log("New event data:", newEvent);

    try {
      
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent)
        });

        
        const responseBody = await res.json();
        console.log("API response body:", responseBody);

        // Check if the POST request was successful
        if (res.ok) {
            
            eventForm.reset();
            
            
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