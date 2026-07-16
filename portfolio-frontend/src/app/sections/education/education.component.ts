import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getEducation } from '../../utils/contentLoader';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  edu: any;

  courseLinks: Record<string, string> = {
    'Data Structures & Algorithms': 'https://cp-algorithms.com/',
    'Operating Systems': 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    'Cloud Computing': 'https://aws.amazon.com/what-is-cloud-computing/',
    'Database Management Systems': 'https://use-the-index-luke.com/',
    'Object Oriented Programming': 'https://refactoring.guru/design-patterns',
  };

  ngOnInit() {
    this.edu = getEducation();
  }
}
