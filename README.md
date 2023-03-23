## cxserverConfig-timeMachine


This repository contains a minimal integration of two tasks, T331202 and T331201, related to configuration evolution over time in the cxserver/config repository. The data is being fetched from all commits since 2017 in the cxserver/config repository. Each relevant config/*.yaml commit is parsed and then outputted as JSON.

## Installation

To use this code, first clone the repository using:

git clone https://github.com/leilakaltouma/cxserver.git

Then, navigate to the directory and install the dependencies using:

npm install

## Usage

To start the parsing process and generate the output in JSON format, run the following command:

npm start

This will fetch the relevant data from the cxserver/config repository, parse it, and output the results in JSON format.
