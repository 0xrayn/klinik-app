<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsDeletion
{
    /**
     * Record a soft-delete in the activity log so it can be reviewed
     * and restored later by an admin.
     */
    public function logDeletion(): void
    {
        ActivityLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'delete',
            'subject_type'  => static::class,
            'subject_id'    => $this->getKey(),
            'subject_label' => $this->activityLabel(),
            'data'          => $this->attributesToArray(),
        ]);
    }

    /**
     * Label shown in the activity log table. Override per model if needed.
     */
    public function activityLabel(): string
    {
        return $this->name ?? ('#' . $this->getKey());
    }
}
