'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card.jsx";
import { Link } from "react-router-dom";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch all events
        fetch("http://localhost:3000/event")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch events");
                return response.json();
            })
            .then((data) => {
                setEvents(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading events...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mt-20">
                <div className="font-bold text-3xl">Events</div>
                <p className="pb-10">
                    These are all the events conducted by the ACM Student Chapter.
                </p>
                <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
                    {events.map((event, i) => (
                        <Link key={i} to={`/events/${event._id}`}>
                            <Card
                                key={i}
                                className="shadow-xl bg-cover relative z-0 rounded-lg transition-all duration-300 hover:scale-105"
                            >
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-60 object-cover rounded-t-lg"
                                />
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">{event.title}</h2>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500">{event.date}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </dl>
            </div>
        </div>
    );
}
