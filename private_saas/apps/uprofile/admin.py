from django.contrib import admin
from .models import Feedback

def _message(s): return s.message[:15]
def _answer(s): return s.answer[:15]

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', _message, _answer, 'created')
admin.site.register(Feedback, FeedbackAdmin)
