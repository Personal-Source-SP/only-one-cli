# TypeORM Reference

- Inject repositories with `@InjectRepository(Entity)` in module-owned providers.
- Do not instantiate repositories manually or bypass module dependency injection.
- Use `DataSource` or injected transaction manager with project transaction convention for atomic multi-write work.
- Keep transaction scope narrow. Do not make network calls inside transaction unless project explicitly requires it.
- Map unique-constraint and missing-record errors through existing application exception conventions.
- Avoid leaking persistence error details through HTTP responses.
