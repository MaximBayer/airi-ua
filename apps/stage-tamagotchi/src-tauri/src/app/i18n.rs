pub struct TrayTranslations {
  pub settings:      String,
  pub window_mode:   String,
  pub position:      String,
  pub hide:          String,
  pub show:          String,
  pub quit:          String,
  pub center:        String,
  pub bottom_left:   String,
  pub bottom_right:  String,
  pub fade_on_hover: String,
  pub move_window:   String,
  pub resize:        String,
}

impl TrayTranslations {
  pub fn new(locale: &str) -> Self {
    match locale {
      "uk" | "uk-UA" => Self {
        settings:      "Налаштування".to_string(),
        window_mode:   "Режим вікна".to_string(),
        position:      "Позиція".to_string(),
        hide:          "Сховати".to_string(),
        show:          "Показати".to_string(),
        quit:          "Вийти".to_string(),
        center:        "По центру".to_string(),
        bottom_left:   "Внизу ліворуч".to_string(),
        bottom_right:  "Внизу праворуч".to_string(),
        fade_on_hover: "Затухання при наведенні".to_string(),
        move_window:   "Переміщення".to_string(),
        resize:        "Масштабування".to_string(),
      },
      "ru" | "ru-RU" => Self {
        settings:      "Настройки".to_string(),
        window_mode:   "Режим окна".to_string(),
        position:      "Позиция".to_string(),
        hide:          "Скрыть".to_string(),
        show:          "Показать".to_string(),
        quit:          "Выйти".to_string(),
        center:        "По центру".to_string(),
        bottom_left:   "Внизу слева".to_string(),
        bottom_right:  "Внизу справа".to_string(),
        fade_on_hover: "Затухание при наведении".to_string(),
        move_window:   "Перемещение".to_string(),
        resize:        "Масштабирование".to_string(),
      },
      _ => Self {
        settings:      "Settings".to_string(),
        window_mode:   "Window Mode".to_string(),
        position:      "Position".to_string(),
        hide:          "Hide".to_string(),
        show:          "Show".to_string(),
        quit:          "Quit".to_string(),
        center:        "Center".to_string(),
        bottom_left:   "Bottom Left".to_string(),
        bottom_right:  "Bottom Right".to_string(),
        fade_on_hover: "Fade On Hover".to_string(),
        move_window:   "Move".to_string(),
        resize:        "Resize".to_string(),
      },
    }
  }
}

pub fn get_locale_from_system() -> String {
  // Try to get locale from system
  match sys_locale::get_locale() {
    Some(locale) => {
      let locale_str = locale.to_lowercase();
      // Map common locale variations
      if locale_str.starts_with("uk") {
        "uk".to_string()
      } else if locale_str.starts_with("ru") {
        "ru".to_string()
      } else if locale_str.starts_with("en") {
        "en".to_string()
      } else {
        "en".to_string() // Default fallback
      }
    },
    None => "en".to_string(), // Default fallback
  }
}
