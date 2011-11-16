from django.contrib import admin
from models import Invitation


class InvitationAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'counter', 'num_allowed_usage')
admin.site.register(Invitation, InvitationAdmin)
