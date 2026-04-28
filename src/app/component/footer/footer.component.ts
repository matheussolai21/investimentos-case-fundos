import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
    imports: [
      CommonModule,
      MatToolbarModule
   ],
})
export class FooterComponent implements OnInit {

  currentYear: number = new Date().getFullYear();

  constructor() { }

  ngOnInit() {
  }


}
