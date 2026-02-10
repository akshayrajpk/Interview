Got it — Angular 16, custom directives. Let’s walk through it cleanly and practically, from **why** to **how**, with a couple of real-world examples.

---

## What is a custom directive?

A directive lets you **attach behavior to an existing DOM element**.

Angular has three types:

* **Component** → has a template
* **Structural directive** → changes DOM layout (`*ngIf`, `*ngFor`)
* **Attribute directive** → changes appearance or behavior (`ngClass`, `ngStyle`)

We’ll focus on **custom attribute directives** first (most common), then touch on structural ones.

---

## 1. Creating a custom directive (Angular 16)

Use the Angular CLI:

```bash
ng generate directive highlight
```

This creates:

```ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  constructor(private el: ElementRef) {}

}
```

---

## 2. Simple attribute directive example (hover highlight)

### Directive code

```ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.highlight(this.appHighlight);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.highlight(null);
  }

  private highlight(color: string | null) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

### Usage in a template

```html
<p appHighlight>
  Default yellow highlight
</p>

<p [appHighlight]="'lightblue'">
  Light blue highlight
</p>
```

---

## 3. Best practice: use `Renderer2` (instead of direct DOM access)

Direct DOM access works, but **Renderer2 is safer** (SSR, Web Workers).

```ts
import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {

  @Input() appHighlight = 'yellow';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.appHighlight
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.removeStyle(
      this.el.nativeElement,
      'background-color'
    );
  }
}
```

---

## 4. Passing multiple inputs to a directive

```html
<p
  appHighlight
  highlightColor="orange"
  defaultColor="transparent"
>
  Multiple inputs example
</p>
```

```ts
@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  @Input() highlightColor = 'yellow';
  @Input() defaultColor = 'transparent';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'background', this.highlightColor);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'background', this.defaultColor);
  }
}
```

---

## 5. Custom structural directive (`*appIf` example)

Structural directives use `TemplateRef` and `ViewContainerRef`.

```ts
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appIf]'
})
export class AppIfDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set appIf(condition: boolean) {
    this.viewContainer.clear();
    if (condition) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
```

### Usage

```html
<div *appIf="isLoggedIn">
  Welcome back!
</div>
```

---

## 6. Angular 16 standalone directive (newer style)

Angular 16 supports **standalone directives** 🔥

```ts
import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.appHighlight);
  }
}
```

### Using it in a standalone component

```ts
@Component({
  standalone: true,
  imports: [HighlightDirective],
  template: `<p appHighlight="pink">Standalone directive</p>`
})
export class DemoComponent {}
```

---

## When should you use a directive?

Use a directive when:

* You **reuse behavior** across many elements
* You want **DOM interaction** without creating components
* Styling depends on logic (hover, permission checks, dynamic classes)

---

If you want, I can:

* Build a **real production-style directive** (permissions, debounce click, auto-focus)
* Explain **directive lifecycle hooks**
* Show **testing directives**
* Compare **directive vs component vs pipe**

Just tell me what angle you want 👌
