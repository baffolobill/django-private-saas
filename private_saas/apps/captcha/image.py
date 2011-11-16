from django.conf import settings
from PIL import Image, ImageColor, ImageFont, ImageDraw
import md5, random

class CaptchaImage(object):
    def __init__(self):
        self.allowed_chars = 'abcdefhkmnptuvwx3468' #ABCDEFGHJKLMNPRTUVWXY3468'
        self.length = 6
        self.size = (200, 40)
        self.font = settings.CAPTCHA_FONT
        self.solution = self.__generate_solution()

    def __generate_solution(self):
        return ''.join([random.choice(self.allowed_chars) for i in range(self.length)])

    def render(self):
        posnew = 20
        bgimg = Image.open(settings.CAPTCHA_BASE_IMAGE)

        for c in self.solution:
            fgimg = Image.new('RGBA', self.size, '#fcfcfc')

            font = ImageFont.truetype(self.font, random.randrange(*(25, 30)))
            charimg = Image.new('L', font.getsize(' %s ' % c), '#000000')

            draw = ImageDraw.Draw(charimg)
            draw.text((0,0), ' %s ' % c, font = font, fill = '#ffffff')
            charimg = charimg.rotate(random.randrange(*(-30, 31)), expand=1, resample=Image.BICUBIC)
            charimg = charimg.crop(charimg.getbbox())

            maskimg = Image.new('L', self.size)
            ypos = random.randrange(*(8, 14))
            maskimg.paste(charimg, (posnew, ypos, charimg.size[0] + posnew, charimg.size[1] + ypos))

            bgimg = Image.composite(fgimg, bgimg, maskimg)
            posnew += charimg.size[0] + random.randrange(*((-2, 8)))

        return bgimg
