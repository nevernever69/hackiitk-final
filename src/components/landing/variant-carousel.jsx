import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function VariantCarousel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch events from the API
        fetch("https://acm-backend-1-asqx.onrender.com/event")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch events.");
                }
                return response.json();
            })
            .then((data) => {
                // Limit to the first 3 events
                setEvents(data.slice(0, 3));
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex lg:flex-row flex-col gap-10">
            {events.map((event, index) => (
                <div
                    key={index}
                    className="transition-all duration-300 hover:scale-105 p-2 shadow-md hover:shadow-xl dark:shadow-md dark:hover:shadow-xl hover:dark:shadow-cyan-300/50 dark:shadow-cyan-300/50"
                >
                    <Link to={`/events/${event._id}`}>
                        <Card
                            className="p-20 lg:p-36 bg-cover relative z-0"
                            style={{
                                backgroundImage: `url('${event.imageUrl}')`,
                            }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
                                <h2 className="text-xl font-bold text-white">{}</h2>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white">{}</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <div className="pt-4"></div>
                </div>
            ))}
        </div>
    );
}
