<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    protected $table = 'notifications';

    protected $fillable = ['user_id', 'type', 'title', 'body', 'url', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a notification for a single user.
     */
    public static function notify(int $userId, string $type, string $title, ?string $body = null, ?string $url = null): self
    {
        return static::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'url'     => $url,
        ]);
    }

    /**
     * Create the same notification for every user that has the given role(s).
     */
    public static function notifyRole(string|array $roles, string $type, string $title, ?string $body = null, ?string $url = null): void
    {
        User::role($roles)->pluck('id')->each(function ($userId) use ($type, $title, $body, $url) {
            static::notify($userId, $type, $title, $body, $url);
        });
    }
}
