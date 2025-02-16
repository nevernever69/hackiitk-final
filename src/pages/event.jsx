import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Event() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://acm-backend-1-asqx.onrender.com/event/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch event details");
        return response.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading event details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!event) return <div>No event found!</div>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
        {/* Event Image Card */}
        <Card className="shadow-2xl rounded-xl bg-cover relative z-0 transition-all duration-300 hover:scale-105">
          <img
            src={event.imageUrl || `/${id}.jpg`} // Dynamic path fallback
            alt={event.title}
            className="w-full h-full object-cover rounded-xl"
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2"></CardHeader>
          <CardContent></CardContent>
        </Card>

        {/* Event Details */}
        <div>
          <h2 className="font-bold text-2xl">{event.title}</h2>
          <p className="text-gray-500">{event.date}</p>
          <div className="pb-8">
            <Separator />
          </div>
          <p className="text-xl leading-relaxed">{event.description}</p>
        </div>
      </dl>
    </div>
  );
}
