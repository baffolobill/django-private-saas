from django.db import models

class Language(models.Model):
    id = models.AutoField(max_length=3, primary_key=True)
    language = models.CharField(max_length=50)
    code = models.CharField(max_length=10, unique=True)

    def __unicode__(self):
        return "id:%i code:%s" % (self.id, self.code)

    class Meta:
        db_table = 'baffolobillcom_language'
        managed = False


class Tags(models.Model):
    id = models.AutoField(max_length=11, primary_key=True)
    stemmed_tag = models.CharField(max_length=255)
    tag = models.CharField(max_length=255)
    language = models.ForeignKey(Language)

    def __unicode__(self):
        return "id:%i tag:%s language:%s" % (self.id, self.tag, self.language.code)

    class Meta:
        db_table = 'baffolobillcom_tags'
        managed = False

