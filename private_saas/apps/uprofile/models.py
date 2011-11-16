from django.db import models
from django.contrib.auth.models import User

class Feedback(models.Model):
    user = models.ForeignKey(User)
    message = models.TextField()
    answer = models.TextField(blank=True)

    created = models.DateTimeField(auto_now_add=True, editable=False)
    modified = models.DateTimeField(auto_now=True, editable=False)

    def __unicode__(self):
        return "%s: %s" % (self.user.username, self.message[:15])

    class Meta:
        ordering = ('-created',)

