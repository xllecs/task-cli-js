#!/usr/bin/env node

import { program } from 'commander'
import fs from 'fs'

program
  .command('list')
  .option('--not-started')
  .option('--in-progress')
  .option('--done')
  .action(options => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))

    if (Object.keys(options).length !== 0) {
      tasks.forEach(task => {
        const { title, desc, status } = Object.values(task)[0]

        const camelizedStatus = status.replace(/\s./g, (match) => {
          return match.toUpperCase()
        }).replace(/\s+/g, '')

        if (camelizedStatus === Object.keys(options)[0]) {
          console.log(`${title}: ${desc}, status: ${status}`)
        }
      })
    } else {
      tasks.forEach(task => {
        const { title, desc, status } = Object.values(task)[0]
        console.log(`${title}: ${desc}, status: ${status}`)
      })
    }
  })

program
  .command('add <title> <desc> [status]')
  .action((title, desc, status = 'not started') => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))
    let taskId = 1

    for (let task of tasks) {
      taskId = Object.keys(task)[0]

      if (Object.values(task)[0].title === title) {
        console.log('task already exists')
        return
      }
    }

    const task = {
      [Number(taskId) + 1]: {
        title, desc, status
      }
    }

    tasks.push(task)

    fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
    console.log('task added successfully')
  })

program
  .command('delete <todoId>')
  .action(taskId => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))

    for (let [index, task] of tasks.entries()) {
      if (Object.keys(task)[0] === taskId) {
        tasks.splice(index, 1)
        console.log('task deleted successfully')
        fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
        return
      }
    }

    console.log('task not found')
  })

program
  .command('update <taskId>')
  .option('--title <title>')
  .option('--desc <desc>')
  .action((taskId, options, title, desc) => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))
    
    if (!options.title && !options.desc) {
      console.log('no changes')
      return
    }

    for (let task of tasks) {
      if (Object.keys(task)[0] === taskId) {
        if (options.title) {
          Object.values(task)[0].title = title
        }

        if (options.desc) {
          Object.values(task)[0].desc = desc
        }

        fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
        console.log('task updated successfully')
        return
      }
    }

    console.log('task not found')
  })

// program
//   .command('mark <todoId>')
//   .option('--not-started')
//   .option('--in-progress')
//   .option('--done')
//   .action((taskId, options) => {
//     let tasks = JSON.parse(fs.readFileSync('tasks.json'))


//   })

program.parse(process.argv)
