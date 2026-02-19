import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit {
  studentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.studentForm = this.fb.group({
      studentName: ['', Validators.required],
      // Define the FormArray
      skills: this.fb.array([]) 
    });
  }

  // Getter for easy access to the FormArray in HTML
  get skills() {
    return this.studentForm.get('skills') as FormArray;
  }

  // Method to create a new Skill FormGroup
  newSkill(): FormGroup {
    return this.fb.group({
      skill: ['', Validators.required],
      exp: ['', Validators.required]
    });
  }

  // Method to add the Skill to the FormArray
  addSkill() {
    this.skills.push(this.newSkill());
  }

  // Method to remove a specific Skill
  removeSkill(i: number) {
    this.skills.removeAt(i);
  }

  onSubmit() {
    console.log(this.studentForm.value);
  }
}
