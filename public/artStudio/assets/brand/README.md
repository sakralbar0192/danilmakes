Куда класть PNG-акценты для фона сайта
=====================================

Положите файлы сюда:

  /home/dukhov/projects/art-studio/assets/brand/

Имена (как в вёрстке):

  accent-corner.png   — верхний правый угол (ветка / пятно)
  accent-heart.png    — сердечко
  accent-palette.png  — палитра
  accent-sprig.png    — веточка с листьями
  accent-pencils.png  — карандаши
  accent-flower.png   — цветок
  hero.png            — заголовок hero
  logo.jpg            — круглый логотип в шапке
  logo-illustration.jpg — квадратная иллюстрация из материалов заказчика

Исходные макеты VK/баннеры — в `../materials/` (см. README там).

Требования к файлам:
  - прозрачный фон (PNG-24 / PNG с alpha)
  - без кремовой подложки
  - желательно 2x размер (например 300–500 px по длинной стороне)

После замены файлов обновите превью на danilmakes:

  cd /home/dukhov/projects/danilmakes && npm run sync:art-studio

Локально смотреть: http://localhost:5173/artStudio/
