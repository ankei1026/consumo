<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConsumerCustomerSupporttNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $customer_support;

    public function __construct($customer_support)
    {
        $this->customer_support = $customer_support;
    }
    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Customer support ' . $this->customer_support->subject,
            'message' => ($this->customer_support->consumer->name ?? 'A user') . ' tells us that ...',
            'support_id' => $this->customer_support->id ?? null,
            'url' => url('/customer-support/' . $this->customer_support->id),
        ];
    }
}
