import { signal } from '@angular/core';

export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.set(this.count() + 1);
  }
}

Template

<button (click)="increment()">+</button>
<p>Count: {{ count() }}</p>

👉 Calling count() reads the value
👉 UI updates automatically when value changes


Computed Signals (Derived State)
import { computed, signal } from '@angular/core';

price = signal(100);
tax = signal(10);

totalPrice = computed(() => this.price() + this.tax());


✅ Automatically recalculates
✅ Memoized
✅ No manual subscriptions

