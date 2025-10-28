import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/integrations/api/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, UserCheck } from "lucide-react";

interface MentorshipBookingProps {
  userPlan: string;
}

export const MentorshipBooking = ({ userPlan }: MentorshipBookingProps) => {
  const [showForm, setShowForm] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (userPlan !== 'premium') {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">1-on-1 Mentorship - Locked</h2>
          <p className="text-lg text-muted-foreground mb-6">
            This feature is only accessible to Premium members.
          </p>
          <p className="text-muted-foreground">
            Upgrade to Premium to unlock personalized mentorship sessions.
          </p>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !bookingTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.createMentorshipBooking({
        bookingDate,
        bookingTime,
        duration,
        message,
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Booking Submitted!",
        description: "Your mentorship session request has been submitted. We'll contact you soon.",
      });

      setBookingDate("");
      setBookingTime("");
      setDuration(60);
      setMessage("");
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">1-on-1 Mentorship</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Book a personalized session with our expert trading mentors.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            Book Your Session
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Book Your Mentorship Session</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="booking-date">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date *
            </Label>
            <Input
              id="booking-date"
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="booking-time">
              <Clock className="h-4 w-4 inline mr-2" />
              Time *
            </Label>
            <Input
              id="booking-time"
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Additional Message (Optional)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you'd like to focus on..."
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Booking"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

